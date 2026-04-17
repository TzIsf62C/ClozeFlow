<script lang="ts">
  import { onMount } from 'svelte';
  import { fly, fade } from 'svelte/transition';
  import { base } from '$app/paths';
  import { db, DEFAULT_GRAM_CATS } from '$lib/db';
  import { sessionStore, allBlanksFilled } from '$lib/stores/session';
  import type { SessionSentence } from '$lib/stores/session';
  import type { BankItem } from '$lib/selectionEngine';

  // ── Category list ─────────────────────────────────────────────────────────

  let availableCategories: string[] = ['All', ...DEFAULT_GRAM_CATS];
  let selectedCat = 'All';
  let isLoading = false;

  onMount(async () => {
    // Rehydrate store from localStorage if a session was in progress.
    sessionStore.init();

    // Load distinct gramCats from the database.
    const words = await db.words.toArray();
    const cats = new Set(words.map((w) => w.gramCat));
    const custom = [...cats].filter((c) => !DEFAULT_GRAM_CATS.includes(c));
    availableCategories = ['All', ...DEFAULT_GRAM_CATS, ...custom];
  });

  // ── Session control ───────────────────────────────────────────────────────

  async function handleStart() {
    isLoading = true;
    await sessionStore.startSession(selectedCat);
    isLoading = false;
  }

  async function handleCheck() {
    isLoading = true;
    await sessionStore.checkAnswers();
    isLoading = false;
  }

  async function handleNext() {
    isLoading = true;
    await sessionStore.nextSession();
    isLoading = false;
  }

  function handleBack() {
    sessionStore.reset();
  }

  // ── Blank answer helper ───────────────────────────────────────────────────

  function getBlankAnswer(sentence: SessionSentence): string {
    const blank = sentence.parts.find((p) => p.type === 'blank');
    return blank && blank.type === 'blank' ? blank.answer : '';
  }
</script>

<svelte:head>
  <title>ClozeFlow — Activity</title>
</svelte:head>

<div class="mx-auto max-w-lg px-4 pt-6">
  <!-- Header -->
  <div class="mb-6 text-center">
    <h1 class="text-2xl font-bold text-gray-900">ClozeFlow</h1>
    <p class="mt-1 text-sm text-gray-500">Fill in the blanks with the correct word</p>
  </div>

  <!-- ── IDLE PHASE ─────────────────────────────────────────────────────── -->
  {#if $sessionStore.phase === 'idle'}
    <div class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
      <h2 class="mb-4 text-lg font-semibold text-gray-800">Start a Session</h2>

      <div class="mb-4">
        <label for="cat-select" class="mb-1.5 block text-sm font-medium text-gray-700">
          Category
        </label>
        <select
          id="cat-select"
          bind:value={selectedCat}
          class="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base
                 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2
                 focus:ring-blue-200"
        >
          {#each availableCategories as cat}
            <option value={cat}>{cat}</option>
          {/each}
        </select>
      </div>

      {#if $sessionStore.errorMsg}
        <div
          class="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {$sessionStore.errorMsg}
          <a href="{base}/manage" class="ml-1 font-semibold underline">Add words →</a>
        </div>
      {/if}

      <button
        on:click={handleStart}
        disabled={isLoading}
        class="tap-target flex w-full items-center justify-center rounded-xl bg-blue-600 px-6 py-3
               text-base font-semibold text-white shadow-sm transition-colors hover:bg-blue-700
               disabled:opacity-50"
      >
        {isLoading ? 'Loading…' : 'Start Session'}
      </button>
    </div>
  {/if}

  <!-- ── ACTIVE & GRADED PHASES ─────────────────────────────────────────── -->
  {#if $sessionStore.phase === 'active' || $sessionStore.phase === 'graded'}
    <!-- Sentences — extra bottom padding so content clears the fixed word bank -->
    <div class="mb-4 space-y-3 {$sessionStore.phase === 'active' ? 'pb-52' : 'pb-4'}">
      {#each $sessionStore.sentences as sentence, idx}
        {@const answer = getBlankAnswer(sentence)}
        <div
          class="rounded-2xl bg-white px-4 py-4 shadow-sm ring-1 ring-gray-100"
          in:fade={{ duration: 200, delay: idx * 60 }}
        >
          <p class="text-base leading-relaxed text-gray-900">
            {#each sentence.parts as part}
              {#if part.type === 'text'}
                <span>{part.content}</span>
              {:else}
                <!-- Blank slot -->
                <button
                  on:click={() => sessionStore.tapFromSentence(idx)}
                  class="
                    tap-target relative mx-1 inline-flex min-w-[80px] items-center justify-center
                    rounded-lg border-2 px-3 py-1 align-middle text-sm font-semibold transition-all
                    {sentence.gradeResult === 'correct'
                      ? 'border-green-400 bg-green-50 text-green-800'
                      : sentence.gradeResult === 'incorrect'
                        ? 'border-red-400 bg-red-50 text-red-800'
                        : sentence.userSelection
                          ? 'border-blue-400 bg-blue-50 text-blue-800 hover:bg-blue-100'
                          : 'border-dashed border-gray-300 bg-gray-50 text-gray-400'}
                  "
                >
                  {#if sentence.gradeResult === 'incorrect' && sentence.showAnswer}
                    <span class="text-green-700">{answer}</span>
                  {:else if sentence.userSelection}
                    {sentence.userSelection.text}
                  {:else}
                    <span class="opacity-40">_____</span>
                  {/if}
                </button>
              {/if}
            {/each}
          </p>

          <!-- Grade hint -->
          {#if sentence.gradeResult === 'incorrect' && !sentence.showAnswer}
            <p class="mt-2 text-xs text-red-500">Tap blank to see correct answer</p>
          {/if}
        </div>
      {/each}
    </div>

    <!-- Word Bank — fixed to bottom of viewport so it stays visible while scrolling -->
    {#if $sessionStore.phase === 'active'}
      <div class="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white px-4 pb-4 pt-3 shadow-lg">
        <div class="mx-auto max-w-lg">
          <!-- Back + Check row -->
          <div class="mb-3 flex gap-3">
            <button
              on:click={handleBack}
              class="tap-target flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-4 py-3
                     text-sm font-semibold text-gray-600 shadow-sm transition-colors hover:bg-gray-50"
            >
              ← Back
            </button>
            <button
              on:click={handleCheck}
              disabled={!$allBlanksFilled || isLoading}
              class="tap-target flex-1 rounded-xl bg-blue-600 py-3 text-base font-semibold text-white
                     shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isLoading ? 'Checking…' : 'Check Answers'}
            </button>
          </div>
          <!-- Chips -->
          <p class="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Word Bank</p>
          <div class="flex flex-wrap gap-2">
            {#each $sessionStore.wordBank as chip (chip.id)}
              <button
                on:click={() => sessionStore.tapFromBank(chip.id)}
                disabled={chip.isUsed}
                in:fly={{ y: 20, duration: 250 }}
                class="
                  tap-target rounded-xl border-2 px-4 py-2 text-sm font-semibold transition-all
                  {chip.isUsed
                    ? 'border-gray-200 bg-gray-100 text-gray-300 opacity-50'
                    : 'border-blue-200 bg-blue-50 text-blue-800 hover:border-blue-400 hover:bg-blue-100 active:scale-95'}
                "
              >
                {chip.text}
              </button>
            {/each}
          </div>
        </div>
      </div>
    {/if}

    <!-- Action buttons — graded phase only -->
    <div class="mb-8 flex gap-3">
      {#if $sessionStore.phase === 'graded'}
        <!-- Back button -->
        <button
          on:click={handleBack}
          class="tap-target flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-4 py-3
                 text-sm font-semibold text-gray-600 shadow-sm transition-colors hover:bg-gray-50"
        >
          ← Back
        </button>

        <!-- Score summary -->
        {@const correct = $sessionStore.sentences.filter((s) => s.gradeResult === 'correct').length}
        {@const total = $sessionStore.sentences.length}
        <div
          class="flex flex-1 items-center justify-center rounded-xl bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700"
        >
          Score: <span class="ml-1 text-lg font-bold text-blue-600">{correct}/{total}</span>
        </div>

        <button
          on:click={handleNext}
          disabled={isLoading}
          class="tap-target flex items-center gap-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white
                 shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-40"
        >
          {isLoading ? 'Loading…' : 'Next →'}
        </button>
      {/if}
    </div>
  {/if}
</div>
