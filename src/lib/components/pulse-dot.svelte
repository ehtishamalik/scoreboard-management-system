<script lang="ts">
  import { cn } from '$lib/utils';

  let { className = 'bg-chart-1/50' }: { className?: string } = $props();
</script>

<div class={cn('size-2 animate-pulse rounded-full', className)}></div>
