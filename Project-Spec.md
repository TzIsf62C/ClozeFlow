# Project Specification: ClozeFlow
**Goal:** A mobile-first SvelteKit application for custom cloze (fill-in-the-blank) language practice using local-only storage.

---

## 1. Core Technical Stack
* **Framework:** SvelteKit (UI & Routing)
* **State Management:** **Svelte Stores** (to track session progress and UI state)
* **Database:** Dexie.js (IndexedDB) for local persistence.
* **Styling:** Tailwind CSS (Mobile-first, responsive).
* **Data Parsing:** PapaParse (for CSV bulk uploads).

---

## 2. Database Schema (Dexie.js)
* **`words` Table:** `++id, word, gramCat, *sentences`
    * `gramCat` includes 12 defaults (Noun, Verb, Adjective, Adposition, Adverb, Auxiliary verb, Classifier, Conjunction, Determiner, Interjection, Particle, Pronoun) plus user-defined strings.
* **`history` Table:** `++id, wordId, sentenceHash, status, lastReviewed`
    * `status` is one of: `never_reviewed`, `incorrect`, `correct`.

---

## 3. The Selection Engine (Svelte Store Logic)
When an activity starts, the app must:
1.  **Filter & Validate:** Filter words by the selected `gramCat` (or "All"). If < 5 words exist, notify the user and prompt for additional categories.
2.  **Prioritization:** Pull 5 words based on this hierarchy:
    * Sentences never viewed.
    * Sentences previously marked `incorrect`.
    * Sentences marked `correct` (oldest first).
3.  **Masking:** For each selected sentence, perform a **case-insensitive** search for the `vocabWord`. Replace the first instance with a "blank" object. If the word is not found (due to typo), skip to the next available sentence for that word.

---

## 4. Interactive UI & Tap-to-Fill Logic
The app must use **Svelte Stores** to manage the "Session State."

### A. The State Machine
* **Word Bank Store:** An array of objects: `{ id, text, isUsed: boolean }`.
* **Sentences Store:** An array of objects containing the split sentence parts and a `userSelection` slot.

### B. Tap Behavior
* **From Bank to Sentence:** When a user taps an available word in the bank:
    1. Set `isUsed: true` for that word.
    2. Find the **first** empty blank in the sentence list and fill it with that word.
* **From Sentence to Bank:** When a user taps a filled blank:
    1. Find the corresponding word in the `wordBank` store and set `isUsed: false`.
    2. Reset the sentence blank to `null`.

---

## 5. Grading & Feedback
* **Check Button:** Compare the `userSelection` text to the actual `vocabWord`.
* **Visuals:**
    * `Correct`: Green background/border.
    * `Incorrect`: Red background/border.
* **Correction:** If a blank is marked incorrect, tapping it toggles the display to show the correct answer. 
* **History Update:** Upon clicking "Check," update the Dexie `history` table for each sentence based on the result.

---

## 6. Content Management
* **Manual Entry:** Form to add Word, Category (Dropdown + "Add Custom"), and one or more sentences.
* **Bulk Upload:** CSV upload functionality using PapaParse. Map columns `word`, `category`, and `sentences` (pipe-separated).
* **Mobile UX:** Ensure all buttons and blanks have a minimum tap target of **44x44px**. Use Svelte `fly` or `fade` transitions for words moving between the bank and sentences.

---

## 7. Implementation Note for Agent
> Please prioritize using **Svelte Stores** for the activity session to ensure state persistence. If the user refreshes the page, the store should ideally sync with `localStorage` so they don't lose their current progress. Use **Tailwind** for a clean, modern, and accessible educational UI.