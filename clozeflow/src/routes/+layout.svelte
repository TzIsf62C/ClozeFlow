<script lang="ts">
  import '../app.css';
  import { page } from '$app/stores';

  const navItems = [
    { href: '/activity', label: 'Activity', icon: '📝' },
    { href: '/manage', label: 'Manage', icon: '⚙️' }
  ];
</script>

<div class="flex min-h-screen flex-col bg-gray-50">
  <!-- Main content -->
  <main class="flex-1 pb-20">
    <slot />
  </main>

  <!-- Bottom navigation bar -->
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
</div>
