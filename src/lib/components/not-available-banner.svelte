<script lang="ts">
  import OctagonXIcon from '@lucide/svelte/icons/octagon-x';
  let { title, description }: { title: string; description: string } = $props();
</script>

<div
  class="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/20 p-12 text-center"
>
  <OctagonXIcon class="mb-4 size-10 text-destructive/50" />

  <h3 class="mb-2 text-xl font-bold tracking-tight">
    {title}
  </h3>

  <p class="mx-auto max-w-sm text-sm text-muted-foreground">
    {description}
  </p>
</div>
