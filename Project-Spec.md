# Project Specification: ClozeFlow
**Goal:** A mobile-first SvelteKit application for custom cloze (fill-in-the-blank) language practice using local-only storage.

---

## 1. Core Technical Stack
* **Framework:** SvelteKit 2 (UI & Routing), Svelte 5, TypeScript, Vite 6
* **State Management:** Custom **Svelte Stores** (writable) to track session progress and UI state, with `localStorage` persistence for in-progress sessions.
* **Database:** Dexie.js (IndexedDB) for local-only persistence.
* **Styling:** Tailwind CSS 3 (mobile-first, responsive). Custom utility `.tap-target` enforces 44×44 px minimum touch targets.
* **Data Parsing:** PapaParse (CSV bulk uploads and sample imports).
* **Rendering:** Fully client-side SPA — `ssr = false`, `prerender = true` (static adapter output).

---

## 2. Routing
| Route | Description |
|---|---|
| `/` | Immediately redirects to `/activity` |
| `/activity` | Main game screen — category selection, active session, graded results |
| `/manage` | Content management — Manual Entry, CSV Upload, Samples tabs |

---

## 3. Database Schema (Dexie.js)
* **`words` Table:** `++id, word, gramCat, *sentences`
    * `gramCat` includes 12 defaults: Noun, Verb, Adjective, Adposition, Adverb, Auxiliary verb, Classifier, Conjunction, Determiner, Interjection, Particle, Pronoun — plus any user-defined strings.
* **`history` Table:** `++id, wordId, sentenceHash, status, lastReviewed`
    * `status` is one of: `never_reviewed`, `incorrect`, `correct`.
    * `sentenceHash` is computed as `btoa(unescape(encodeURIComponent(`${wordId}|${sentenceText}`)))` for stable cross-session identity.
    * `lastReviewed` is a Unix timestamp in milliseconds.

---

## 4. The Selection Engine (`src/lib/selectionEngine.ts`)

### Word Priority Buckets
Each word is assigned to a priority bucket based on the best (lowest-priority) maskable sentence it has:
* **Bucket 1:** Word has at least one sentence with status `never_reviewed`.
* **Bucket 2:** Word has at least one sentence with status `incorrect` (but none `never_reviewed`).
* **Bucket 3:** All maskable sentences are `correct`.

### Word Selection (up to 5)
Words are drawn randomly within each bucket, in bucket order:
1. Shuffle Bucket 1; draw randomly until 5 selected or bucket exhausted.
2. Continue with Bucket 2 (random draw).
3. Continue with Bucket 3: sort by **day-truncated** `lastReviewed` (`Math.floor(ms / 86_400_000)`) oldest-first; within the same calendar day, treat words as equal priority and randomise among them.

### Sentence Selection (per word)
Once a word is selected, collect all maskable sentences that belong to the bucket by which the word was selected. Shuffle them. Try each until `maskSentence()` succeeds (finds a `(...)` marker in the text).

### Masking (`maskSentence`)
Sentences must embed the target word's contextual (inflected) form inside parentheses: e.g. `She finally (achieved) her goal.`

`maskSentence(sentence)` uses the regex `/\(([^)]+)\)/` to find the first `(contextualForm)` marker. The parens and their contents are replaced with a `{ type: 'blank', answer: contextualForm }` part; the surrounding text becomes `{ type: 'text' }` parts. Returns `null` if no marker is found (sentence skipped). The function no longer needs the base word as input.

### Contextual Forms in the Word Bank
Word bank chips display the **contextual (inflected) form** extracted from the `(...)` marker, not the base dictionary form. For correct-answer chips this is `blankPart.answer`. For distractor chips, `getContextualForm(word)` shuffles the distractor's sentences and returns the first `(...)` match, falling back to `word.word` if none is found.

### Display and Word Bank
* The final array of up to 5 `SessionWord` objects is **shuffled** before being returned, so sentence display order is random each session.
* Up to 2 distractor words (from the same category, not in the selected 5) are added to the word bank.
* The full word bank (correct answers + distractors) is shuffled.
* Chip text is always the contextual form (see **Contextual Forms in the Word Bank** above), so the form shown matches exactly what the user must place in the blank.

---

## 5. Session State Machine (`src/lib/stores/session.ts`)

### Phases
| Phase | Description |
|---|---|
| `idle` | Category selector shown; no active session |
| `active` | Sentences displayed; word bank visible; user filling blanks |
| `graded` | Results displayed with correct/incorrect feedback |

### Store Shape
```ts
SessionState = {
  phase: 'idle' | 'active' | 'graded',
  gramCat: string,
  wordBank: BankItem[],    // { id, text, isDistractor, isUsed }
  sentences: SessionSentence[],
  errorMsg: string | null
}
```

### Persistence
Active sessions (`phase === 'active'`) are serialised to `localStorage` under the key `clozeflow_session`. On page load, the store rehydrates from `localStorage` so in-progress sessions survive a refresh. Idle and graded states clear the key.

### Store Methods
| Method | Behaviour |
|---|---|
| `init()` | Rehydrate from `localStorage` on mount |
| `startSession(gramCat)` | Run selection engine; populate word bank and sentences |
| `tapFromBank(id)` | Mark chip `isUsed: true`; fill first empty blank |
| `tapFromSentence(idx)` | If ungraded: return chip to bank. If graded incorrect: toggle `showAnswer`. If graded correct: no-op |
| `checkAnswers()` | Grade all blanks; upsert `history` records in Dexie; advance to `graded` |
| `nextSession()` | Call `startSession` with the current `gramCat` |
| `reset()` | Return to `INITIAL_STATE` (idle) |

---

## 6. Activity Page UI (`/activity`)

### Navigation Bar
The bottom navigation bar is **phase-aware**:
* Visible on the activity page only when `phase === 'idle'` (category selection screen). This lets the user navigate to Manage before starting.
* Hidden once a session is `active` or `graded` — the in-session controls replace it.
* Always visible on all other pages (e.g. `/manage`).

### Idle Phase
* Category `<select>` dropdown populated from all distinct `gramCat` values in the DB.
* "Start Session" button.
* Error message with link to Manage if no words are found.

### Active Phase
* Sentences displayed in a scrollable list with `fade` transitions.
* **Word bank is fixed to the bottom of the viewport** (not scrolled with content), with a white background and top border. The sentence list has bottom padding to prevent content hiding behind the fixed bar.
* The fixed bar contains (top row): **`← Back`** button (resets to idle) and **`Check Answers`** button (disabled until all blanks filled).
* Word chips use `fly` transition. Used chips are visually dimmed.

### Graded Phase
* Correct blanks: green border/background.
* Incorrect blanks: red border/background; tap to toggle display of the correct answer.
* Action row (left to right): **`← Back`** | **Score `X/5`** | **`Next →`**
    * Back resets to idle.
    * Next starts a new session in the same category.

---

## 7. Content Management Page (`/manage`)

Three tabs:

### Tab 1 — Manual Entry
* Fields: Vocabulary Word, Category (dropdown with all known cats + "Add custom category" toggle), one or more Example Sentences (dynamic add/remove rows).
* **Sentence format:** Wrap the contextual (inflected) form of the word in parentheses so the masking engine can locate it: e.g. `She finally (achieved) her goal after months of training.` An amber hint box explaining this is shown below the sentences fieldset.
* Saves via `db.words.add()`.

### Tab 2 — CSV Upload
* Drag-and-drop zone and file picker (`.csv` only).
* Format: `word,category,sentences` — multiple sentences separated by `|`.
* **Sentence format:** Each sentence must wrap the contextual form in parentheses: e.g. `run,Verb,She (runs) every day.|He (ran) as fast as he could.` Sentences without a `(...)` marker are silently skipped by the masking engine.
* Parsed with PapaParse; errors reported per row.

### Tab 3 — Samples
* CSV files placed in `static/samples/` are **embedded at build time** using Vite's `import.meta.glob` with `query: '?raw'`. No HTTP fetch occurs at runtime; content is bundled into the JavaScript.
* Each file appears as a language button derived from its filename (`Chinese_Traditional.csv` → "Chinese Traditional").
* **Unimported state:** `🌐 Language Name` button — clicking imports all rows into the DB.
* **Imported state:** `🗑️ N Language Name` button (N = count of matching words in DB) — clicking deletes all words that exactly match the CSV (by `word` + `gramCat`), along with their `history` records.
* Status is checked live against the DB when the Samples tab is first opened.

### Saved Words List
* Displayed below the tabs on all tab views.
* Each entry shows: word, gramCat badge, sentence count, and a delete button (also removes associated `history` records).

---

## 8. File Structure
```
clozeflow/
├── src/
│   ├── app.css               # Tailwind directives + tap-target utility
│   ├── app.html
│   ├── lib/
│   │   ├── db.ts             # Dexie schema, computeSentenceHash, DEFAULT_GRAM_CATS
│   │   ├── selectionEngine.ts # Word/sentence selection, masking, bank building
│   │   └── stores/
│   │       └── session.ts    # Session store, localStorage persistence
│   └── routes/
│       ├── +layout.svelte    # Nav bar (phase-aware visibility)
│       ├── +layout.ts        # ssr=false, prerender=true
│       ├── +page.svelte      # Redirect → /activity
│       ├── activity/
│       │   └── +page.svelte
│       └── manage/
│           └── +page.svelte
└── static/
    └── samples/              # Drop *.csv files here; auto-discovered at build time
        ├── Chinese_Traditional.csv
        └── English.csv
```

---

## 9. Adding Sample Language Files
Place any `.csv` file in `static/samples/`. The filename (underscores replaced with spaces, extension removed) becomes the button label on the Samples tab. The file must use the standard format:
```
word,category,sentences
run,Verb,She runs every day.|He ran fast yesterday.
```
Rebuild the app (`npm run build`) after adding new files so Vite embeds them.
