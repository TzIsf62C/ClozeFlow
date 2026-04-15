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

  // 3. For each word, find its best (lowest-priority) maskable sentence.
  type ScoredWord = {
    word: Word;
    sentenceHash: string;
    parts: SentencePart[];
    priority: number;       // 1 | 2 | 3
    lastReviewed: number;   // for tie-breaking priority 3
  };

  const scored: ScoredWord[] = [];

  for (const word of allWords) {
    // Sort sentences by their individual priority to try best first.
    type CandidateSentence = { text: string; hash: string; priority: number; lastReviewed: number };
    const candidates: CandidateSentence[] = word.sentences.map((text) => {
      const hash = computeSentenceHash(word.id!, text);
      const priority = scoreSentence(hash, historyMap);
      const lastReviewed = historyMap.get(hash)?.lastReviewed ?? 0;
      return { text, hash, priority, lastReviewed };
    });

    // Sort: priority asc, then lastReviewed asc (oldest first).
    candidates.sort((a, b) =>
      a.priority !== b.priority ? a.priority - b.priority : a.lastReviewed - b.lastReviewed
    );

    // Try each sentence (in priority order) until one can be masked.
    let chosen: ScoredWord | null = null;
    for (const c of candidates) {
      const parts = maskSentence(word.word, c.text);
      if (parts) {
        chosen = {
          word,
          sentenceHash: c.hash,
          parts,
          priority: c.priority,
          lastReviewed: c.lastReviewed
        };
        break;
      }
    }

    if (chosen) scored.push(chosen);
  }

  if (scored.length === 0) {
    return { error: 'no_words' };
  }

  // 4. Sort scored words and take up to 5.
  scored.sort((a, b) =>
    a.priority !== b.priority ? a.priority - b.priority : a.lastReviewed - b.lastReviewed
  );
  const selected = scored.slice(0, 5);
  const selectedIds = new Set(selected.map((s) => s.word.id!));

  // 5. Build session words.
  const sessionWords: SessionWord[] = selected.map((s) => ({
    wordId: s.word.id!,
    word: s.word.word,
    sentenceHash: s.sentenceHash,
    parts: s.parts
  }));

  // 6. Pick up to 2 distractors from same category (not among selected).
  const distractor_pool = allWords.filter(
    (w) =>
      !selectedIds.has(w.id!) &&
      (gramCat === 'All' ? true : w.gramCat === gramCat)
  );
  shuffle(distractor_pool);
  const distractors = distractor_pool.slice(0, 2);

  // 7. Build + shuffle bank items.
  const bankItems: BankItem[] = shuffle([
    ...selected.map((s) => ({
      id: String(s.word.id!),
      text: s.word.word,
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
