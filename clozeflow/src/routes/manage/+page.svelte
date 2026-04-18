<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import Papa from 'papaparse';
  import { db, DEFAULT_GRAM_CATS } from '$lib/db';
  import type { Word } from '$lib/db';

  // ── Tab state ─────────────────────────────────────────────────────────────

  let activeTab: 'manual' | 'csv' | 'samples' = 'manual';

  // ── Word list ─────────────────────────────────────────────────────────────

  let words: Word[] = [];
  let isLoadingWords = false;

  async function loadWords() {
    isLoadingWords = true;
    words = await db.words.toArray();
    isLoadingWords = false;
  }

  onMount(loadWords);

  // ── Manual Entry ──────────────────────────────────────────────────────────

  let manualWord = '';
  let manualCat = DEFAULT_GRAM_CATS[0];
  let customCatInput = '';
  let isCustomCat = false;
  let manualSentences: string[] = [''];
  let manualError = '';
  let manualSuccess = '';
  let isSaving = false;

  // Collect all categories: defaults + any user-defined ones already in DB.
  let allCats: string[] = [...DEFAULT_GRAM_CATS];

  async function loadCats() {
    const stored = await db.words.toArray();
    const custom = [...new Set(stored.map((w) => w.gramCat))].filter(
      (c) => !DEFAULT_GRAM_CATS.includes(c)
    );
    allCats = [...DEFAULT_GRAM_CATS, ...custom];
  }

  onMount(loadCats);

  function addSentenceRow() {
    manualSentences = [...manualSentences, ''];
  }

  function removeSentenceRow(idx: number) {
    manualSentences = manualSentences.filter((_, i) => i !== idx);
    if (manualSentences.length === 0) manualSentences = [''];
  }

  async function handleManualSubmit() {
    manualError = '';
    manualSuccess = '';

    const word = manualWord.trim();
    const cat = isCustomCat ? customCatInput.trim() : manualCat;
    const sentences = manualSentences.map((s) => s.trim()).filter(Boolean);

    if (!word) { manualError = 'Word is required.'; return; }
    if (!cat) { manualError = 'Category is required.'; return; }
    if (sentences.length === 0) { manualError = 'At least one sentence is required.'; return; }

    isSaving = true;
    try {
      await db.words.add({ word, gramCat: cat, sentences });
      manualWord = '';
      manualSentences = [''];
      manualSuccess = `"${word}" added successfully.`;
      await loadWords();
      await loadCats();
      if (!allCats.includes(cat)) allCats = [...allCats, cat];
    } catch (e) {
      manualError = 'Failed to save word. Please try again.';
    } finally {
      isSaving = false;
    }
  }

  // ── CSV Upload ────────────────────────────────────────────────────────────

  let csvError = '';
  let csvSuccess = '';
  let isUploading = false;
  let dragOver = false;

  interface CsvRow {
    word?: string;
    category?: string;
    sentences?: string;
  }

  async function processCsvRows(rows: CsvRow[]) {
    csvError = '';
    csvSuccess = '';
    isUploading = true;

    let count = 0;
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const word = row.word?.trim();
      const cat = row.category?.trim();
      const sentences = row.sentences
        ?.split('|')
        .map((s: string) => s.trim())
        .filter(Boolean);

      if (!word || !cat || !sentences || sentences.length === 0) {
        errors.push(`Row ${i + 2}: missing word, category, or sentences.`);
        continue;
      }

      try {
        await db.words.add({ word, gramCat: cat, sentences });
        count++;
      } catch {
        errors.push(`Row ${i + 2}: failed to save "${word}".`);
      }
    }

    if (errors.length > 0) {
      csvError = errors.join(' ');
    }
    if (count > 0) {
      csvSuccess = `${count} word(s) imported successfully.`;
      await loadWords();
      await loadCats();
    }

    isUploading = false;
  }

  function handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    parseCsvFile(file);
    input.value = '';
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    dragOver = false;
    const file = event.dataTransfer?.files?.[0];
    if (!file) return;
    parseCsvFile(file);
  }

  function parseCsvFile(file: File) {
    if (!file.name.endsWith('.csv')) {
      csvError = 'Please upload a .csv file.';
      return;
    }

    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        processCsvRows(results.data);
      },
      error: () => {
        csvError = 'Failed to parse CSV file.';
      }
    });
  }

  // ── Word deletion ─────────────────────────────────────────────────────────

  async function deleteWord(id: number) {
    await db.words.delete(id);
    await db.history.where('wordId').equals(id).delete();
    await loadWords();
  }

  // ── Samples ───────────────────────────────────────────────────────────────

  // Vite glob: embeds each CSV's raw text content directly in the bundle at build time.
  // This avoids any HTTP fetch at runtime and works identically in dev and production.
  const sampleGlob = import.meta.glob('/static/samples/*.csv', { eager: true, query: '?raw', import: 'default' });

  interface SampleFile {
    name: string;       // display name, e.g. "Chinese Traditional"
    content: string;    // raw CSV text embedded at build time
    filename: string;   // e.g. "Chinese_Traditional.csv"
  }

  const sampleFiles: SampleFile[] = Object.entries(sampleGlob).map(([path, content]) => {
    const filename = path.split('/').pop()!;
    const name = filename.replace(/\.csv$/i, '').replace(/_/g, ' ');
    return { name, content: content as string, filename };
  });

  // Tracks imported count per filename. -1 = unknown/loading.
  let samplesStatus: Record<string, number> = {};
  let samplesLoading: Record<string, boolean> = {};

  interface CsvRow {
    word?: string;
    category?: string;
    sentences?: string;
  }

  /** Parse a CSV string (already embedded via ?raw) and return the rows. */
  function fetchSampleRows(content: string): CsvRow[] {
    const result = Papa.parse<CsvRow>(content, {
      header: true,
      skipEmptyLines: true
    });
    return result.data;
  }

  /** Count how many rows from the sample CSV currently exist in the DB. */
  async function countSampleInDb(rows: CsvRow[]): Promise<number> {
    let count = 0;
    for (const row of rows) {
      const word = row.word?.trim();
      const cat = row.category?.trim();
      if (!word || !cat) continue;
      const match = await db.words
        .where('word').equals(word)
        .filter((w) => w.gramCat === cat)
        .first();
      if (match) count++;
    }
    return count;
  }

  /** Refresh the imported-count for all sample files. */
  async function refreshSamplesStatus() {
    for (const sf of sampleFiles) {
      samplesLoading = { ...samplesLoading, [sf.filename]: true };
      const rows = fetchSampleRows(sf.content);
      const count = await countSampleInDb(rows);
      samplesStatus = { ...samplesStatus, [sf.filename]: count };
      samplesLoading = { ...samplesLoading, [sf.filename]: false };
    }
  }

  let samplesError = '';
  let samplesSuccess = '';

  /** Import a sample CSV into the DB. */
  async function importSample(sf: SampleFile) {
    samplesError = '';
    samplesSuccess = '';
    samplesLoading = { ...samplesLoading, [sf.filename]: true };
    const rows = fetchSampleRows(sf.content);
    await processCsvRows(rows);
    const count = await countSampleInDb(rows);
    samplesStatus = { ...samplesStatus, [sf.filename]: count };
    samplesSuccess = `${sf.name} samples imported.`;
    await loadWords();
    await loadCats();
    samplesLoading = { ...samplesLoading, [sf.filename]: false };
  }

  /** Delete all words that exactly match a sample CSV (word + gramCat). */
  async function deleteSample(sf: SampleFile) {
    samplesError = '';
    samplesSuccess = '';
    samplesLoading = { ...samplesLoading, [sf.filename]: true };
    const rows = fetchSampleRows(sf.content);
    for (const row of rows) {
      const word = row.word?.trim();
      const cat = row.category?.trim();
      if (!word || !cat) continue;
      const matches = await db.words
        .where('word').equals(word)
        .filter((w) => w.gramCat === cat)
        .toArray();
      for (const m of matches) {
        await db.history.where('wordId').equals(m.id!).delete();
        await db.words.delete(m.id!);
      }
    }
    samplesStatus = { ...samplesStatus, [sf.filename]: 0 };
    samplesSuccess = `${sf.name} samples deleted.`;
    await loadWords();
    await loadCats();
    samplesLoading = { ...samplesLoading, [sf.filename]: false };
  }

  // Load samples status when tab becomes active.
  $: if (activeTab === 'samples' && Object.keys(samplesStatus).length === 0) {
    refreshSamplesStatus();
  }
</script>

<svelte:head>
  <title>ClozeFlow — Manage</title>
</svelte:head>

<div class="mx-auto max-w-lg px-4 pt-6">
  <h1 class="mb-6 text-2xl font-bold text-gray-900">Manage Words</h1>

  <!-- Tabs -->
  <div class="mb-6 flex rounded-xl bg-gray-100 p-1">
    {#each [{ id: 'manual', label: 'Manual Entry' }, { id: 'csv', label: 'CSV Upload' }, { id: 'samples', label: 'Samples' }] as tab}
      <button
        on:click={() => (activeTab = tab.id as 'manual' | 'csv' | 'samples')}
        class="
          tap-target flex-1 rounded-lg py-2 text-sm font-semibold transition-all
          {activeTab === tab.id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}
        "
      >
        {tab.label}
      </button>
    {/each}
  </div>

  <!-- ── MANUAL ENTRY ──────────────────────────────────────────────────── -->
  {#if activeTab === 'manual'}
    <div in:fade={{ duration: 150 }} class="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
      <form on:submit|preventDefault={handleManualSubmit} class="space-y-4">
        <!-- Word -->
        <div>
          <label for="word-input" class="mb-1 block text-sm font-medium text-gray-700">
            Vocabulary Word
          </label>
          <input
            id="word-input"
            type="text"
            bind:value={manualWord}
            placeholder="e.g. run"
            class="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base
                   text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <!-- Category -->
        <div>
          <label for={isCustomCat ? 'custom-cat-input' : 'cat-select'} class="mb-1 block text-sm font-medium text-gray-700">Category</label>
          {#if isCustomCat}
            <div class="flex gap-2">
              <input
                id="custom-cat-input"
              type="text"
                bind:value={customCatInput}
                placeholder="Enter custom category"
                class="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base
                       text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <button
                type="button"
                on:click={() => { isCustomCat = false; customCatInput = ''; }}
                class="tap-target rounded-xl border border-gray-200 px-3 text-sm text-gray-500 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          {:else}
            <select
              id="cat-select"
              bind:value={manualCat}
              class="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base
                     text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              {#each allCats as cat}
                <option value={cat}>{cat}</option>
              {/each}
            </select>
            <button
              type="button"
              on:click={() => (isCustomCat = true)}
              class="mt-1.5 text-sm text-blue-600 hover:underline"
            >
              + Add custom category
            </button>
          {/if}
        </div>

        <!-- Sentences -->
        <fieldset>
          <legend class="mb-1 block text-sm font-medium text-gray-700">
            Example Sentences
          </legend>
          <p class="mb-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Wrap the target word (or its contextual form) in <strong>parentheses</strong> to mark the blank.
            <span class="font-mono">She finally (achieved) her goal.</span>
          </p>
          <div class="space-y-2">
            {#each manualSentences as _, idx}
              <div class="flex gap-2">
                <textarea
                  bind:value={manualSentences[idx]}
                  placeholder="e.g. She finally (achieved) her goal after months of training."
                  rows="2"
                  class="flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2
                         text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                ></textarea>
                {#if manualSentences.length > 1}
                  <button
                    type="button"
                    on:click={() => removeSentenceRow(idx)}
                    class="tap-target self-start rounded-xl border border-gray-200 px-3 py-2 text-gray-400
                           hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                  >
                    ✕
                  </button>
                {/if}
              </div>
            {/each}
          </div>
          <button
            type="button"
            on:click={addSentenceRow}
            class="mt-2 text-sm text-blue-600 hover:underline"
          >
            + Add another sentence
          </button>
        </fieldset>

        <!-- Alerts -->
        {#if manualError}
          <div class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {manualError}
          </div>
        {/if}
        {#if manualSuccess}
          <div class="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {manualSuccess}
          </div>
        {/if}

        <button
          type="submit"
          disabled={isSaving}
          class="tap-target w-full rounded-xl bg-blue-600 py-3 text-base font-semibold text-white
                 shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {isSaving ? 'Saving…' : 'Save Word'}
        </button>
      </form>
    </div>
  {/if}

  <!-- ── CSV UPLOAD ──────────────────────────────────────────────────────── -->
  {#if activeTab === 'csv'}
    <div in:fade={{ duration: 150 }} class="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
      <!-- Instructions -->
      <div class="mb-4 rounded-xl bg-blue-50 p-4 text-sm text-blue-800">
        <p class="font-semibold">CSV Format</p>
        <p class="mt-1 font-mono text-xs">word,category,sentences</p>
        <p class="mt-0.5 font-mono text-xs">run,Verb,She (runs) every day.|He (ran) fast.</p>
        <p class="mt-2 text-xs text-blue-600">Use <strong>|</strong> to separate multiple sentences. Wrap the target word (or its contextual form) in <strong>(parentheses)</strong> to mark the blank.</p>
      </div>

      <!-- Drop zone -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div
        role="button"
        tabindex="0"
        on:dragover|preventDefault={() => (dragOver = true)}
        on:dragleave={() => (dragOver = false)}
        on:drop={handleDrop}
        on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') document.getElementById('csv-input')?.click(); }}
        class="
          relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed
          py-10 text-center transition-colors
          {dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-gray-50 hover:border-blue-300'}
        "
      >
        <span class="text-3xl">📄</span>
        <p class="mt-3 text-sm font-medium text-gray-700">
          Drag & drop a CSV file, or
        </p>
        <label
          for="csv-input"
          class="mt-2 cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold
                 text-white shadow-sm hover:bg-blue-700"
        >
          Choose file
        </label>
        <input
          id="csv-input"
          type="file"
          accept=".csv"
          class="sr-only"
          on:change={handleFileSelect}
        />
      </div>

      <!-- Alerts -->
      {#if isUploading}
        <div class="mt-4 text-center text-sm text-gray-500">Importing…</div>
      {/if}
      {#if csvError}
        <div class="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {csvError}
        </div>
      {/if}
      {#if csvSuccess}
        <div class="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {csvSuccess}
        </div>
      {/if}
    </div>
  {/if}

  <!-- ── SAMPLES ────────────────────────────────────────────────────────── -->
  {#if activeTab === 'samples'}
    <div in:fade={{ duration: 150 }} class="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
      <p class="mb-1 text-sm text-gray-500">
        Click a language to import sample words and sentences. Click again to remove them.
      </p>

      {#if sampleFiles.length === 0}
        <div class="mt-6 rounded-xl border border-dashed border-gray-200 py-10 text-center text-sm text-gray-400">
          No sample files found. Add CSV files to the <code class="font-mono">static/samples/</code> folder.
        </div>
      {:else}
        <div class="mt-4 flex flex-wrap gap-3">
          {#each sampleFiles as sf}
            {@const count = samplesStatus[sf.filename] ?? -1}
            {@const loading = samplesLoading[sf.filename] ?? false}
            {@const imported = count > 0}
            {#if imported}
              <button
                on:click={() => deleteSample(sf)}
                disabled={loading}
                class="tap-target rounded-xl border-2 border-red-200 bg-red-50 px-4 py-2 text-sm
                       font-semibold text-red-700 transition-colors hover:border-red-400 hover:bg-red-100
                       disabled:opacity-50"
              >
                {loading ? 'Working…' : `🗑️ ${count} ${sf.name}`}
              </button>
            {:else}
              <button
                on:click={() => importSample(sf)}
                disabled={loading}
                class="tap-target rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-2 text-sm
                       font-semibold text-gray-700 transition-colors hover:border-blue-300 hover:bg-blue-50
                       hover:text-blue-700 disabled:opacity-50"
              >
                {loading ? 'Working…' : `🌐 ${sf.name}`}
              </button>
            {/if}
          {/each}
        </div>
      {/if}

      {#if samplesError}
        <div class="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {samplesError}
        </div>
      {/if}
      {#if samplesSuccess}
        <div class="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {samplesSuccess}
        </div>
      {/if}
    </div>
  {/if}

  <!-- ── WORD LIST ───────────────────────────────────────────────────────── -->
  <div class="mb-10 mt-8">
    <h2 class="mb-4 text-base font-semibold text-gray-700">
      Saved Words
      {#if words.length > 0}
        <span class="ml-1 text-gray-400">({words.length})</span>
      {/if}
    </h2>

    {#if isLoadingWords}
      <p class="text-center text-sm text-gray-400">Loading…</p>
    {:else if words.length === 0}
      <div class="rounded-xl border border-dashed border-gray-200 py-10 text-center text-sm text-gray-400">
        No words yet. Add some above!
      </div>
    {:else}
      <div class="space-y-2">
        {#each words as word (word.id)}
          <div
            in:fade={{ duration: 150 }}
            class="flex items-start justify-between gap-3 rounded-xl bg-white px-4 py-3
                   shadow-sm ring-1 ring-gray-100"
          >
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <span class="font-semibold text-gray-900">{word.word}</span>
                <span class="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                  {word.gramCat}
                </span>
              </div>
              <p class="mt-0.5 truncate text-xs text-gray-400">
                {word.sentences.length} sentence{word.sentences.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              on:click={() => deleteWord(word.id!)}
              class="tap-target flex-shrink-0 rounded-lg p-2 text-gray-300 hover:bg-red-50
                     hover:text-red-500 transition-colors"
              aria-label="Delete word"
            >
              🗑
            </button>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
