import Dexie, { type Table } from 'dexie';

// ── Types ────────────────────────────────────────────────────────────────────

export type HistoryStatus = 'never_reviewed' | 'incorrect' | 'correct';

export interface Word {
  id?: number;
  word: string;
  gramCat: string;
  sentences: string[];
}

export interface HistoryRecord {
  id?: number;
  wordId: number;
  sentenceHash: string;
  status: HistoryStatus;
  lastReviewed: number; // Unix timestamp ms
}

// ── Constants ─────────────────────────────────────────────────────────────────

export const DEFAULT_GRAM_CATS: string[] = [
  'Noun',
  'Verb',
  'Adjective',
  'Adposition',
  'Adverb',
  'Auxiliary verb',
  'Classifier',
  'Conjunction',
  'Determiner',
  'Interjection',
  'Particle',
  'Pronoun'
];

// ── Hash Helper ───────────────────────────────────────────────────────────────

/**
 * Deterministic hash for a (wordId, sentenceText) pair.
 * Used as a stable key in the history table.
 */
export function computeSentenceHash(wordId: number, sentenceText: string): string {
  return btoa(unescape(encodeURIComponent(`${wordId}|${sentenceText}`)));
}

// ── Database ──────────────────────────────────────────────────────────────────

class ClozeFlowDB extends Dexie {
  words!: Table<Word, number>;
  history!: Table<HistoryRecord, number>;

  constructor() {
    super('ClozeFlowDB');
    this.version(1).stores({
      words: '++id, word, gramCat, *sentences',
      history: '++id, wordId, sentenceHash, status, lastReviewed'
    });
  }
}

export const db = new ClozeFlowDB();
