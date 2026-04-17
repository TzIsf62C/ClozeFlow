import { e as derived, g as get, w as writable } from "./index.js";
import { d as db, c as computeSentenceHash } from "./db.js";
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
function maskSentence(word, sentence) {
  const idx = sentence.toLowerCase().indexOf(word.toLowerCase());
  if (idx === -1) return null;
  const parts = [];
  if (idx > 0) parts.push({ type: "text", content: sentence.slice(0, idx) });
  parts.push({ type: "blank", answer: sentence.slice(idx, idx + word.length) });
  if (idx + word.length < sentence.length) {
    parts.push({ type: "text", content: sentence.slice(idx + word.length) });
  }
  return parts;
}
function scoreSentence(hash, historyMap) {
  const record = historyMap.get(hash);
  if (!record || record.status === "never_reviewed") return 1;
  if (record.status === "incorrect") return 2;
  return 3;
}
function buildHistoryMap(records) {
  const map = /* @__PURE__ */ new Map();
  for (const r of records) {
    const existing = map.get(r.sentenceHash);
    if (!existing || r.lastReviewed > existing.lastReviewed) {
      map.set(r.sentenceHash, r);
    }
  }
  return map;
}
async function selectSentences(gramCat) {
  const allWords = gramCat === "All" ? await db.words.toArray() : await db.words.where("gramCat").equals(gramCat).toArray();
  if (allWords.length === 0) {
    return { error: "no_words" };
  }
  const wordIds = allWords.map((w) => w.id);
  const historyRecords = await db.history.where("wordId").anyOf(wordIds).toArray();
  const historyMap = buildHistoryMap(historyRecords);
  const scoredWords = [];
  for (const word of allWords) {
    const byPriority = { 1: [], 2: [], 3: [] };
    for (const text of word.sentences) {
      const hash = computeSentenceHash(word.id, text);
      const priority = scoreSentence(hash, historyMap);
      const record = historyMap.get(hash);
      const lastReviewed = record?.lastReviewed ?? 0;
      const dayBucket = Math.floor(lastReviewed / 864e5);
      if (maskSentence(word.word, text) !== null) {
        byPriority[priority].push({ text, hash, priority, dayBucket, lastReviewed });
      }
    }
    let wordPriority = null;
    for (const p of [1, 2, 3]) {
      if (byPriority[p].length > 0) {
        wordPriority = p;
        break;
      }
    }
    if (wordPriority === null) continue;
    const eligibleSentences = byPriority[wordPriority];
    const oldestDayBucket = wordPriority === 3 ? Math.min(...eligibleSentences.map((s) => s.dayBucket)) : 0;
    scoredWords.push({ word, wordPriority, eligibleSentences, oldestDayBucket });
  }
  if (scoredWords.length === 0) {
    return { error: "no_words" };
  }
  const bucket1 = scoredWords.filter((w) => w.wordPriority === 1);
  const bucket2 = scoredWords.filter((w) => w.wordPriority === 2);
  const bucket3Raw = scoredWords.filter((w) => w.wordPriority === 3);
  const bucket3 = (() => {
    if (bucket3Raw.length === 0) return [];
    const dayGroups = /* @__PURE__ */ new Map();
    for (const w of bucket3Raw) {
      const g = dayGroups.get(w.oldestDayBucket) ?? [];
      g.push(w);
      dayGroups.set(w.oldestDayBucket, g);
    }
    const sortedDays = [...dayGroups.keys()].sort((a, b) => a - b);
    const result = [];
    for (const day of sortedDays) {
      result.push(...shuffle(dayGroups.get(day)));
    }
    return result;
  })();
  const selected = [];
  const selectedIds = /* @__PURE__ */ new Set();
  function drawRandom(pool) {
    const available = pool.filter((w) => !selectedIds.has(w.word.id));
    shuffle(available);
    for (const w of available) {
      if (selected.length >= 5) break;
      selected.push(w);
      selectedIds.add(w.word.id);
    }
  }
  drawRandom(bucket1);
  if (selected.length < 5) drawRandom(bucket2);
  if (selected.length < 5) {
    for (const w of bucket3) {
      if (selected.length >= 5) break;
      if (!selectedIds.has(w.word.id)) {
        selected.push(w);
        selectedIds.add(w.word.id);
      }
    }
  }
  const sessionWords = [];
  for (const sw of selected) {
    const candidates = shuffle([...sw.eligibleSentences]);
    let chosen = null;
    for (const c of candidates) {
      const parts = maskSentence(sw.word.word, c.text);
      if (parts) {
        chosen = {
          wordId: sw.word.id,
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
    return { error: "no_words" };
  }
  shuffle(sessionWords);
  const distractor_pool = allWords.filter((w) => !selectedIds.has(w.id));
  shuffle(distractor_pool);
  const distractors = distractor_pool.slice(0, 2);
  const bankItems = shuffle([
    ...sessionWords.map((s) => ({
      id: String(s.wordId),
      text: s.word,
      isDistractor: false,
      isUsed: false
    })),
    ...distractors.map((d) => ({
      id: `dist-${d.id}`,
      text: d.word,
      isDistractor: true,
      isUsed: false
    }))
  ]);
  return { sessionWords, bankItems };
}
const LS_KEY = "clozeflow_session";
function saveToStorage(state) {
  try {
    if (state.phase === "active") {
      localStorage.setItem(LS_KEY, JSON.stringify(state));
    } else {
      localStorage.removeItem(LS_KEY);
    }
  } catch {
  }
}
function loadFromStorage() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.phase !== "active") return null;
    return parsed;
  } catch {
    return null;
  }
}
const INITIAL_STATE = {
  phase: "idle",
  gramCat: "All",
  wordBank: [],
  sentences: [],
  errorMsg: null
};
function createSessionStore() {
  const { subscribe, set, update } = writable(INITIAL_STATE);
  function mutate(fn) {
    update((state) => {
      const next = fn(state);
      saveToStorage(next);
      return next;
    });
  }
  function init() {
    if (typeof window === "undefined") return;
    const saved = loadFromStorage();
    if (saved) {
      set(saved);
    }
  }
  async function startSession(gramCat) {
    mutate((s) => ({ ...s, phase: "idle", errorMsg: null, gramCat }));
    const result = await selectSentences(gramCat);
    if ("error" in result) {
      mutate((s) => ({
        ...s,
        errorMsg: "No words found in this category. Add some words first."
      }));
      return;
    }
    const sentences = result.sessionWords.map((sw) => ({
      wordId: sw.wordId,
      sentenceHash: sw.sentenceHash,
      parts: sw.parts,
      userSelection: null,
      gradeResult: null,
      showAnswer: false
    }));
    mutate(() => ({
      phase: "active",
      gramCat,
      wordBank: result.bankItems,
      sentences,
      errorMsg: null
    }));
  }
  function tapFromBank(bankItemId) {
    mutate((state) => {
      if (state.phase !== "active") return state;
      const bank = state.wordBank.map((b) => ({ ...b }));
      const chip = bank.find((b) => b.id === bankItemId);
      if (!chip || chip.isUsed) return state;
      const sentences = state.sentences.map((s) => ({ ...s }));
      const targetIdx = sentences.findIndex(
        (s) => s.userSelection === null && s.gradeResult === null
      );
      if (targetIdx === -1) return state;
      chip.isUsed = true;
      sentences[targetIdx] = { ...sentences[targetIdx], userSelection: chip };
      return { ...state, wordBank: bank, sentences };
    });
  }
  function tapFromSentence(sentenceIdx) {
    mutate((state) => {
      if (state.phase !== "active" && state.phase !== "graded") return state;
      const sentences = state.sentences.map((s) => ({ ...s }));
      const sentence = sentences[sentenceIdx];
      if (!sentence || sentence.userSelection === null) return state;
      if (sentence.gradeResult === "incorrect") {
        sentences[sentenceIdx] = { ...sentence, showAnswer: !sentence.showAnswer };
        return { ...state, sentences };
      }
      if (sentence.gradeResult === "correct") return state;
      const bank = state.wordBank.map((b) => ({
        ...b,
        isUsed: b.id === sentence.userSelection.id ? false : b.isUsed
      }));
      sentences[sentenceIdx] = { ...sentence, userSelection: null };
      return { ...state, wordBank: bank, sentences };
    });
  }
  async function checkAnswers() {
    const state = get({ subscribe });
    if (state.phase !== "active") return;
    const now = Date.now();
    const sentences = state.sentences.map((s) => {
      const blankPart = s.parts.find((p) => p.type === "blank");
      const answer = blankPart && blankPart.type === "blank" ? blankPart.answer : "";
      const userText = s.userSelection?.text ?? "";
      const isCorrect = userText.toLowerCase() === answer.toLowerCase();
      return {
        ...s,
        gradeResult: isCorrect ? "correct" : "incorrect",
        showAnswer: false
      };
    });
    for (const s of sentences) {
      const status = s.gradeResult === "correct" ? "correct" : "incorrect";
      const existing = await db.history.where("sentenceHash").equals(s.sentenceHash).filter((r) => r.wordId === s.wordId).first();
      if (existing) {
        await db.history.update(existing.id, { status, lastReviewed: now });
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
      phase: "graded",
      sentences
    }));
    try {
      localStorage.removeItem(LS_KEY);
    } catch {
    }
  }
  async function nextSession() {
    const state = get({ subscribe });
    await startSession(state.gramCat);
  }
  function reset() {
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
const sessionStore = createSessionStore();
const allBlanksFilled = derived(
  sessionStore,
  ($s) => $s.phase === "active" && $s.sentences.every((s) => s.userSelection !== null)
);
export {
  allBlanksFilled as a,
  sessionStore as s
};
