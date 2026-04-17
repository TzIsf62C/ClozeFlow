import { db, computeSentenceHash } from '$lib/db';
import type { HistoryRecord, Word } from '$lib/db';

// ── Public types ─────────────────────────────────────────────────────────────

/** One "part" of a sentence: plain text or the masked blank. */
export type SentencePart =
  | { type: 'text'; content: string }
  | { type: 'blank'; answer: string };

/** A session word ready for the activity view. */
export interface SessionWord {
  wordId: number;
  word: string;
  sentenceHash: string;
  parts: SentencePart[];
}

/** A bank chip (the correct answers + distractors). */
export interface BankItem {
  id: string;         // unique per chip (wordId for answers, 'dist-<wordId>' for distractors)
  text: string;
  isDistractor: boolean;
  isUsed: boolean;
}

export interface SelectionResult {
  sessionWords: SessionWord[];
  bankItems: BankItem[];
}

export interface SelectionError {
  error: 'no_words';
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Shuffle an array in-place (Fisher-Yates). */
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Mask the first case-insensitive occurrence of `word` inside `sentence`.
 * Returns null if the word is not found (caller skips to next sentence).
 */
function maskSentence(word: string, sentence: string): SentencePart[] | null {
  const idx = sentence.toLowerCase().indexOf(word.toLowerCase());
  if (idx === -1) return null;

  const parts: SentencePart[] = [];
  if (idx > 0) parts.push({ type: 'text', content: sentence.slice(0, idx) });
  parts.push({ type: 'blank', answer: sentence.slice(idx, idx + word.length) });
  if (idx + word.length < sentence.length) {
    parts.push({ type: 'text', content: sentence.slice(idx + word.length) });
  }
  return parts;
}

/**
 * Score priority for a sentence.
 * 1 = never reviewed, 2 = incorrect, 3 = correct.
 */
function scoreSentence(hash: string, historyMap: Map<string, HistoryRecord>): number {
  const record = historyMap.get(hash);
  if (!record || record.status === 'never_reviewed') return 1;
  if (record.status === 'incorrect') return 2;
  return 3;
}

/** Build the history map key: sentenceHash. */
function buildHistoryMap(records: HistoryRecord[]): Map<string, HistoryRecord> {
  const map = new Map<string, HistoryRecord>();
  for (const r of records) {
    // Keep the most recently reviewed record if duplicates exist.
    const existing = map.get(r.sentenceHash);
    if (!existing || r.lastReviewed > existing.lastReviewed) {
      map.set(r.sentenceHash, r);
    }
  }
  return map;
}

// ── Main engine ───────────────────────────────────────────────────────────────

export async function selectSentences(
  gramCat: string | 'All'
): Promise<SelectionResult | SelectionError> {
  // 1. Fetch candidate words.
  const allWords: Word[] =
    gramCat === 'All'
      ? await db.words.toArray()
      : await db.words.where('gramCat').equals(gramCat).toArray();

  if (allWords.length === 0) {
    return { error: 'no_words' };
  }

  // 2. Fetch history for all candidates in a single batch query.
  const wordIds = allWords.map((w) => w.id!);
  const historyRecords = await db.history.where('wordId').anyOf(wordIds).toArray();
  const historyMap = buildHistoryMap(historyRecords);

  // 3. For each word, collect all maskable sentences grouped by priority bucket.
  //    Priority 1 = never_reviewed, 2 = incorrect, 3 = correct.
  //    A word's "word priority" = lowest bucket it has any maskable sentence in.
  type MaskableSentence = {
    text: string;
    hash: string;
    priority: number;
    dayBucket: number; // Math.floor(lastReviewed / 86400000) — for same-day tie-breaking
    lastReviewed: number;
  };

  type ScoredWord = {
    word: Word;
    wordPriority: number;
    // All maskable sentences that match the word's priority bucket (for random pick).
    eligibleSentences: MaskableSentence[];
    // Lowest lastReviewed among priority-3 sentences (for tie-breaking within bucket 3).
    oldestDayBucket: number;
  };

  const scoredWords: ScoredWord[] = [];

  for (const word of allWords) {
    const byPriority: Record<number, MaskableSentence[]> = { 1: [], 2: [], 3: [] };

    for (const text of word.sentences) {
      const hash = computeSentenceHash(word.id!, text);
      const priority = scoreSentence(hash, historyMap);
      const record = historyMap.get(hash);
      const lastReviewed = record?.lastReviewed ?? 0;
      const dayBucket = Math.floor(lastReviewed / 86_400_000);

      // Only include this sentence if it can actually be masked.
      if (maskSentence(word.word, text) !== null) {
        byPriority[priority].push({ text, hash, priority, dayBucket, lastReviewed });
      }
    }

    // Word priority = lowest non-empty bucket.
    let wordPriority: number | null = null;
    for (const p of [1, 2, 3]) {
      if (byPriority[p].length > 0) {
        wordPriority = p;
        break;
      }
    }

    if (wordPriority === null) continue; // No maskable sentences at all — skip word.

    // Eligible sentences = those matching the word's own priority bucket.
    const eligibleSentences = byPriority[wordPriority];

    // Oldest day bucket (used for priority-3 sorting across days).
    const oldestDayBucket =
      wordPriority === 3
        ? Math.min(...eligibleSentences.map((s) => s.dayBucket))
        : 0;

    scoredWords.push({ word, wordPriority, eligibleSentences, oldestDayBucket });
  }

  if (scoredWords.length === 0) {
    return { error: 'no_words' };
  }

  // 4. Select 5 words using random sampling within priority buckets.
  const bucket1 = scoredWords.filter((w) => w.wordPriority === 1);
  const bucket2 = scoredWords.filter((w) => w.wordPriority === 2);
  // Bucket 3: sort by oldestDayBucket ASC; within same day randomize.
  const bucket3Raw = scoredWords.filter((w) => w.wordPriority === 3);

  // Group bucket-3 words by their oldestDayBucket and shuffle within each group.
  const bucket3 = (() => {
    if (bucket3Raw.length === 0) return [];
    const dayGroups = new Map<number, ScoredWord[]>();
    for (const w of bucket3Raw) {
      const g = dayGroups.get(w.oldestDayBucket) ?? [];
      g.push(w);
      dayGroups.set(w.oldestDayBucket, g);
    }
    const sortedDays = [...dayGroups.keys()].sort((a, b) => a - b);
    const result: ScoredWord[] = [];
    for (const day of sortedDays) {
      result.push(...shuffle(dayGroups.get(day)!));
    }
    return result;
  })();

  // Random-draw from each bucket in turn until we have 5.
  const selected: ScoredWord[] = [];
  const selectedIds = new Set<number>();

  function drawRandom(pool: ScoredWord[]) {
    const available = pool.filter((w) => !selectedIds.has(w.word.id!));
    shuffle(available);
    for (const w of available) {
      if (selected.length >= 5) break;
      selected.push(w);
      selectedIds.add(w.word.id!);
    }
  }

  drawRandom(bucket1);
  if (selected.length < 5) drawRandom(bucket2);
  if (selected.length < 5) {
    // Bucket 3 is already ordered (oldest day first, randomised within day).
    for (const w of bucket3) {
      if (selected.length >= 5) break;
      if (!selectedIds.has(w.word.id!)) {
        selected.push(w);
        selectedIds.add(w.word.id!);
      }
    }
  }

  // 5. For each selected word, randomly pick one sentence from its eligible set.
  const sessionWords: SessionWord[] = [];

  for (const sw of selected) {
    const candidates = shuffle([...sw.eligibleSentences]);
    let chosen: SessionWord | null = null;
    for (const c of candidates) {
      const parts = maskSentence(sw.word.word, c.text);
      if (parts) {
        chosen = {
          wordId: sw.word.id!,
          word: sw.word.word,
          sentenceHash: c.hash,
          parts
        };
        break;
      }
    }
    if (chosen) sessionWords.push(chosen);
  }

  if (sessionWords.length === 0) {
    return { error: 'no_words' };
  }

  // 6. Randomise display order of sentences.
  shuffle(sessionWords);

  // 7. Pick up to 2 distractors from same category (not among selected).
  const distractor_pool = allWords.filter((w) => !selectedIds.has(w.id!));
  shuffle(distractor_pool);
  const distractors = distractor_pool.slice(0, 2);

  // 8. Build + shuffle bank items.
  const bankItems: BankItem[] = shuffle([
    ...sessionWords.map((s) => ({
      id: String(s.wordId),
      text: s.word,
      isDistractor: false,
      isUsed: false
    })),
    ...distractors.map((d) => ({
      id: `dist-${d.id!}`,
      text: d.word,
      isDistractor: true,
      isUsed: false
    }))
  ]);

  return { sessionWords, bankItems };
}
