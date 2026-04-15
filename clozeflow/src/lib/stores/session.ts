import { writable, derived, get } from 'svelte/store';
import { db } from '$lib/db';
import { selectSentences } from '$lib/selectionEngine';
import type { BankItem, SessionWord, SentencePart } from '$lib/selectionEngine';

// ── Types ─────────────────────────────────────────────────────────────────────

export type SessionPhase = 'idle' | 'active' | 'graded';

export type GradeResult = 'correct' | 'incorrect' | null;

export interface SessionSentence {
  wordId: number;
  sentenceHash: string;
  parts: SentencePart[];
  /** The bank item currently placed in this blank. */
  userSelection: BankItem | null;
  gradeResult: GradeResult;
  /** Toggle: tapping an incorrect graded blank reveals the correct answer. */
  showAnswer: boolean;
}

export interface SessionState {
  phase: SessionPhase;
  gramCat: string;
  wordBank: BankItem[];
  sentences: SessionSentence[];
  errorMsg: string | null;
}

// ── LocalStorage key ──────────────────────────────────────────────────────────

const LS_KEY = 'clozeflow_session';

// ── Serialise / Deserialise ───────────────────────────────────────────────────

function saveToStorage(state: SessionState): void {
  try {
    // Only persist active sessions (not idle or graded).
    if (state.phase === 'active') {
      localStorage.setItem(LS_KEY, JSON.stringify(state));
    } else {
      localStorage.removeItem(LS_KEY);
    }
  } catch {
    // localStorage may be unavailable (e.g., SSR or private mode).
  }
}

function loadFromStorage(): SessionState | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SessionState;
    // Validate minimal shape.
    if (parsed.phase !== 'active') return null;
    return parsed;
  } catch {
    return null;
  }
}

// ── Initial state ─────────────────────────────────────────────────────────────

const INITIAL_STATE: SessionState = {
  phase: 'idle',
  gramCat: 'All',
  wordBank: [],
  sentences: [],
  errorMsg: null
};

// ── Store factory ─────────────────────────────────────────────────────────────

function createSessionStore() {
  const { subscribe, set, update } = writable<SessionState>(INITIAL_STATE);

  /** Persist on every mutation. */
  function mutate(fn: (s: SessionState) => SessionState): void {
    update((state) => {
      const next = fn(state);
      saveToStorage(next);
      return next;
    });
  }

  // Try rehydrating from localStorage on first load.
  function init(): void {
    if (typeof window === 'undefined') return;
    const saved = loadFromStorage();
    if (saved) {
      set(saved);
    }
  }

  async function startSession(gramCat: string): Promise<void> {
    mutate((s) => ({ ...s, phase: 'idle', errorMsg: null, gramCat }));

    const result = await selectSentences(gramCat);

    if ('error' in result) {
      mutate((s) => ({
        ...s,
        errorMsg: 'No words found in this category. Add some words first.'
      }));
      return;
    }

    const sentences: SessionSentence[] = result.sessionWords.map((sw: SessionWord) => ({
      wordId: sw.wordId,
      sentenceHash: sw.sentenceHash,
      parts: sw.parts,
      userSelection: null,
      gradeResult: null,
      showAnswer: false
    }));

    mutate(() => ({
      phase: 'active',
      gramCat,
      wordBank: result.bankItems,
      sentences,
      errorMsg: null
    }));
  }

  /**
   * Tap a word chip in the bank.
   * Finds the first unfilled, ungraded blank and places the word there.
   */
  function tapFromBank(bankItemId: string): void {
    mutate((state) => {
      if (state.phase !== 'active') return state;

      const bank = state.wordBank.map((b) => ({ ...b }));
      const chip = bank.find((b) => b.id === bankItemId);
      if (!chip || chip.isUsed) return state;

      // Find first blank with no user selection and no grade result (not graded).
      const sentences = state.sentences.map((s) => ({ ...s }));
      const targetIdx = sentences.findIndex(
        (s) => s.userSelection === null && s.gradeResult === null
      );
      if (targetIdx === -1) return state; // All blanks filled.

      chip.isUsed = true;
      sentences[targetIdx] = { ...sentences[targetIdx], userSelection: chip };

      return { ...state, wordBank: bank, sentences };
    });
  }

  /**
   * Tap a filled blank in a sentence.
   * - If ungraded: return the word to the bank.
   * - If graded incorrect: toggle showAnswer.
   * - If graded correct: do nothing.
   */
  function tapFromSentence(sentenceIdx: number): void {
    mutate((state) => {
      if (state.phase !== 'active' && state.phase !== 'graded') return state;

      const sentences = state.sentences.map((s) => ({ ...s }));
      const sentence = sentences[sentenceIdx];
      if (!sentence || sentence.userSelection === null) return state;

      // Graded — only toggle showAnswer for incorrect.
      if (sentence.gradeResult === 'incorrect') {
        sentences[sentenceIdx] = { ...sentence, showAnswer: !sentence.showAnswer };
        return { ...state, sentences };
      }

      if (sentence.gradeResult === 'correct') return state; // Locked.

      // Ungraded — return to bank.
      const bank = state.wordBank.map((b) => ({
        ...b,
        isUsed: b.id === sentence.userSelection!.id ? false : b.isUsed
      }));
      sentences[sentenceIdx] = { ...sentence, userSelection: null };

      return { ...state, wordBank: bank, sentences };
    });
  }

  /**
   * Grade all sentences, write history to Dexie, advance to 'graded' phase.
   */
  async function checkAnswers(): Promise<void> {
    const state = get({ subscribe });
    if (state.phase !== 'active') return;

    const now = Date.now();
    const sentences: SessionSentence[] = state.sentences.map((s) => {
      // Find the answer in parts.
      const blankPart = s.parts.find((p) => p.type === 'blank');
      const answer = blankPart && blankPart.type === 'blank' ? blankPart.answer : '';
      const userText = s.userSelection?.text ?? '';
      const isCorrect = userText.toLowerCase() === answer.toLowerCase();
      return {
        ...s,
        gradeResult: isCorrect ? 'correct' : 'incorrect',
        showAnswer: false
      };
    });

    // Write history to Dexie.
    for (const s of sentences) {
      const status = s.gradeResult === 'correct' ? 'correct' : 'incorrect';
      // Upsert: find existing record for this sentenceHash.
      const existing = await db.history
        .where('sentenceHash')
        .equals(s.sentenceHash)
        .filter((r) => r.wordId === s.wordId)
        .first();

      if (existing) {
        await db.history.update(existing.id!, { status, lastReviewed: now });
      } else {
        await db.history.add({
          wordId: s.wordId,
          sentenceHash: s.sentenceHash,
          status,
          lastReviewed: now
        });
      }
    }

    mutate(() => ({
      ...state,
      phase: 'graded',
      sentences
    }));
    // Clear saved session — it's over.
    try { localStorage.removeItem(LS_KEY); } catch { /* ignore */ }
  }

  /** Reset to idle and start a new session with the same category. */
  async function nextSession(): Promise<void> {
    const state = get({ subscribe });
    await startSession(state.gramCat);
  }

  /** Fully reset to idle. */
  function reset(): void {
    mutate(() => ({ ...INITIAL_STATE }));
  }

  return {
    subscribe,
    init,
    startSession,
    tapFromBank,
    tapFromSentence,
    checkAnswers,
    nextSession,
    reset
  };
}

// ── Exported store ────────────────────────────────────────────────────────────

export const sessionStore = createSessionStore();

/** True when all blanks have a user selection (enables Check button). */
export const allBlanksFilled = derived(sessionStore, ($s) =>
  $s.phase === 'active' && $s.sentences.every((s) => s.userSelection !== null)
);
