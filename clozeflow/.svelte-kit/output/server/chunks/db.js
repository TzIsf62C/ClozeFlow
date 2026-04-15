import Dexie from "dexie";
const DEFAULT_GRAM_CATS = [
  "Noun",
  "Verb",
  "Adjective",
  "Adposition",
  "Adverb",
  "Auxiliary verb",
  "Classifier",
  "Conjunction",
  "Determiner",
  "Interjection",
  "Particle",
  "Pronoun"
];
function computeSentenceHash(wordId, sentenceText) {
  return btoa(unescape(encodeURIComponent(`${wordId}|${sentenceText}`)));
}
class ClozeFlowDB extends Dexie {
  words;
  history;
  constructor() {
    super("ClozeFlowDB");
    this.version(1).stores({
      words: "++id, word, gramCat, *sentences",
      history: "++id, wordId, sentenceHash, status, lastReviewed"
    });
  }
}
const db = new ClozeFlowDB();
export {
  DEFAULT_GRAM_CATS as D,
  computeSentenceHash as c,
  db as d
};
