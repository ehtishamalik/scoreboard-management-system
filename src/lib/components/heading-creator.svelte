<script lang="ts">
  import { cn } from '$lib/utils';
  import type { Snippet } from 'svelte';

  let {
    title,
    description,
    type = 'h1',
    children
  }: { title: string; description?: string; type?: 'h1' | 'h2'; children?: Snippet } = $props();
</script>

<header class={cn('flex items-center justify-between', type === 'h1' ? 'mb-3 py-4' : 'py-2')}>
  <div class="flex flex-col gap-2">
    {#if type === 'h1'}
      <h1 class="text-4xl font-bold tracking-tight">{title}</h1>
    {:else}
      <h2 class="text-2xl font-bold tracking-tight">{title}</h2>
    {/if}
    {#if description}
      <p class="max-w-2xl text-sm text-muted-foreground">{description}</p>
    {/if}
  </div>

  <div class="space-x-2">
    {@render children?.()}
  </div>
</header>
