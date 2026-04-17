<script lang="ts">
  import '../app.css';
  import { page } from '$app/stores';
  import { base } from '$app/paths';
  import { sessionStore } from '$lib/stores/session';

  const navItems = [
    { href: `${base}/activity`, label: 'Activity', icon: '📝' },
    { href: `${base}/manage`, label: 'Manage', icon: '⚙️' }
  ];

  // Show nav on the activity page only when no session is in progress (idle phase).
  $: isActivityPage = $page.url.pathname.startsWith(`${base}/activity`);
  $: showNav = !isActivityPage || $sessionStore.phase === 'idle';
</script>

<div class="flex min-h-screen flex-col bg-gray-50">
  <!-- Main content — bottom padding only when nav is visible -->
  <main class="flex-1 {showNav ? 'pb-20' : ''}">
    <slot />
  </main>

  <!-- Bottom navigation bar -->
  {#if showNav}
    <nav class="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white shadow-lg">
      <div class="mx-auto flex max-w-lg">
        {#each navItems as item}
          {@const active = $page.url.pathname.startsWith(item.href)}
          <a
            href={item.href}
            class="flex flex-1 flex-col items-center justify-center gap-1 py-3 text-sm font-medium transition-colors tap-target
              {active ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}"
          >
            <span class="text-xl leading-none">{item.icon}</span>
            <span class="text-xs">{item.label}</span>
            {#if active}
              <span class="absolute bottom-0 h-0.5 w-12 rounded-t-full bg-blue-600"></span>
            {/if}
          </a>
        {/each}
      </div>
    </nav>
  {/if}
</div>
