import { h as head, a as store_get, e as ensure_array_like, d as escape_html, b as attr, c as attr_class, f as stringify, u as unsubscribe_stores } from "../../../chunks/renderer.js";
import { b as base } from "../../../chunks/server.js";
import "../../../chunks/url.js";
import "@sveltejs/kit/internal/server";
import "../../../chunks/root.js";
import { d as db, c as computeSentenceHash, D as DEFAULT_GRAM_CATS } from "../../../chunks/db.js";
import { d as derived, g as get, w as writable } from "../../../chunks/index.js";
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
  const scored = [];
  for (const word of allWords) {
    const candidates = word.sentences.map((text) => {
      const hash = computeSentenceHash(word.id, text);
      const priority = scoreSentence(hash, historyMap);
      const lastReviewed = historyMap.get(hash)?.lastReviewed ?? 0;
      return { text, hash, priority, lastReviewed };
    });
    candidates.sort(
      (a, b) => a.priority !== b.priority ? a.priority - b.priority : a.lastReviewed - b.lastReviewed
    );
    let chosen = null;
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
    return { error: "no_words" };
  }
  scored.sort(
    (a, b) => a.priority !== b.priority ? a.priority - b.priority : a.lastReviewed - b.lastReviewed
  );
  const selected = scored.slice(0, 5);
  const selectedIds = new Set(selected.map((s) => s.word.id));
  const sessionWords = selected.map((s) => ({
    wordId: s.word.id,
    word: s.word.word,
    sentenceHash: s.sentenceHash,
    parts: s.parts
  }));
  const distractor_pool = allWords.filter(
    (w) => !selectedIds.has(w.id) && (gramCat === "All" ? true : w.gramCat === gramCat)
  );
  shuffle(distractor_pool);
  const distractors = distractor_pool.slice(0, 2);
  const bankItems = shuffle([
    ...selected.map((s) => ({
      id: String(s.word.id),
      text: s.word.word,
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
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let availableCategories = ["All", ...DEFAULT_GRAM_CATS];
    let selectedCat = "All";
    let isLoading = false;
    function getBlankAnswer(sentence) {
      const blank = sentence.parts.find((p) => p.type === "blank");
      return blank && blank.type === "blank" ? blank.answer : "";
    }
    head("13r34ge", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>ClozeFlow — Activity</title>`);
      });
    });
    $$renderer2.push(`<div class="mx-auto max-w-lg px-4 pt-6"><div class="mb-6 text-center"><h1 class="text-2xl font-bold text-gray-900">ClozeFlow</h1> <p class="mt-1 text-sm text-gray-500">Fill in the blanks with the correct word</p></div> `);
    if (store_get($$store_subs ??= {}, "$sessionStore", sessionStore).phase === "idle") {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100"><h2 class="mb-4 text-lg font-semibold text-gray-800">Start a Session</h2> <div class="mb-4"><label for="cat-select" class="mb-1.5 block text-sm font-medium text-gray-700">Category</label> `);
      $$renderer2.select(
        {
          id: "cat-select",
          value: selectedCat,
          class: "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        },
        ($$renderer3) => {
          $$renderer3.push(`<!--[-->`);
          const each_array = ensure_array_like(availableCategories);
          for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
            let cat = each_array[$$index];
            $$renderer3.option({ value: cat }, ($$renderer4) => {
              $$renderer4.push(`${escape_html(cat)}`);
            });
          }
          $$renderer3.push(`<!--]-->`);
        }
      );
      $$renderer2.push(`</div> `);
      if (store_get($$store_subs ??= {}, "$sessionStore", sessionStore).errorMsg) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">${escape_html(store_get($$store_subs ??= {}, "$sessionStore", sessionStore).errorMsg)} <a${attr("href", `${stringify(base)}/manage`)} class="ml-1 font-semibold underline">Add words →</a></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> <button${attr("disabled", isLoading, true)} class="tap-target flex w-full items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-50">${escape_html("Start Session")}</button></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (store_get($$store_subs ??= {}, "$sessionStore", sessionStore).phase === "active" || store_get($$store_subs ??= {}, "$sessionStore", sessionStore).phase === "graded") {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="mb-6 space-y-3"><!--[-->`);
      const each_array_1 = ensure_array_like(store_get($$store_subs ??= {}, "$sessionStore", sessionStore).sentences);
      for (let idx = 0, $$length = each_array_1.length; idx < $$length; idx++) {
        let sentence = each_array_1[idx];
        const answer = getBlankAnswer(sentence);
        $$renderer2.push(`<div class="rounded-2xl bg-white px-4 py-4 shadow-sm ring-1 ring-gray-100"><p class="text-base leading-relaxed text-gray-900"><!--[-->`);
        const each_array_2 = ensure_array_like(sentence.parts);
        for (let $$index_1 = 0, $$length2 = each_array_2.length; $$index_1 < $$length2; $$index_1++) {
          let part = each_array_2[$$index_1];
          if (part.type === "text") {
            $$renderer2.push("<!--[0-->");
            $$renderer2.push(`<span>${escape_html(part.content)}</span>`);
          } else {
            $$renderer2.push("<!--[-1-->");
            $$renderer2.push(`<button${attr_class(` tap-target relative mx-1 inline-flex min-w-[80px] items-center justify-center rounded-lg border-2 px-3 py-1 align-middle text-sm font-semibold transition-all ${stringify(sentence.gradeResult === "correct" ? "border-green-400 bg-green-50 text-green-800" : sentence.gradeResult === "incorrect" ? "border-red-400 bg-red-50 text-red-800" : sentence.userSelection ? "border-blue-400 bg-blue-50 text-blue-800 hover:bg-blue-100" : "border-dashed border-gray-300 bg-gray-50 text-gray-400")} `)}>`);
            if (sentence.gradeResult === "incorrect" && sentence.showAnswer) {
              $$renderer2.push("<!--[0-->");
              $$renderer2.push(`<span class="text-green-700">${escape_html(answer)}</span>`);
            } else if (sentence.userSelection) {
              $$renderer2.push("<!--[1-->");
              $$renderer2.push(`${escape_html(sentence.userSelection.text)}`);
            } else {
              $$renderer2.push("<!--[-1-->");
              $$renderer2.push(`<span class="opacity-40">_____</span>`);
            }
            $$renderer2.push(`<!--]--></button>`);
          }
          $$renderer2.push(`<!--]-->`);
        }
        $$renderer2.push(`<!--]--></p> `);
        if (sentence.gradeResult === "incorrect" && !sentence.showAnswer) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<p class="mt-2 text-xs text-red-500">Tap blank to see correct answer</p>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]--></div>`);
      }
      $$renderer2.push(`<!--]--></div> `);
      if (store_get($$store_subs ??= {}, "$sessionStore", sessionStore).phase === "active") {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="mb-6 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100"><p class="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Word Bank</p> <div class="flex flex-wrap gap-2"><!--[-->`);
        const each_array_3 = ensure_array_like(store_get($$store_subs ??= {}, "$sessionStore", sessionStore).wordBank);
        for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
          let chip = each_array_3[$$index_3];
          $$renderer2.push(`<button${attr("disabled", chip.isUsed, true)}${attr_class(` tap-target rounded-xl border-2 px-4 py-2 text-sm font-semibold transition-all ${stringify(chip.isUsed ? "border-gray-200 bg-gray-100 text-gray-300 opacity-50" : "border-blue-200 bg-blue-50 text-blue-800 hover:border-blue-400 hover:bg-blue-100 active:scale-95")} `)}>${escape_html(chip.text)}</button>`);
        }
        $$renderer2.push(`<!--]--></div></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> <div class="mb-8 flex gap-3">`);
      if (store_get($$store_subs ??= {}, "$sessionStore", sessionStore).phase === "active") {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<button${attr("disabled", !store_get($$store_subs ??= {}, "$allBlanksFilled", allBlanksFilled) || isLoading, true)} class="tap-target flex-1 rounded-xl bg-blue-600 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40">${escape_html("Check Answers")}</button>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> `);
      if (store_get($$store_subs ??= {}, "$sessionStore", sessionStore).phase === "graded") {
        $$renderer2.push("<!--[0-->");
        const correct = store_get($$store_subs ??= {}, "$sessionStore", sessionStore).sentences.filter((s) => s.gradeResult === "correct").length;
        const total = store_get($$store_subs ??= {}, "$sessionStore", sessionStore).sentences.length;
        $$renderer2.push(`<div class="flex flex-1 items-center justify-center rounded-xl bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700">Score: <span class="ml-1 text-lg font-bold text-blue-600">${escape_html(correct)}/${escape_html(total)}</span></div> <button${attr("disabled", isLoading, true)} class="tap-target flex-1 rounded-xl bg-blue-600 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-40">${escape_html("Next Session →")}</button>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
