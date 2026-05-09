<script lang="ts">
  import { cn } from '$lib/utils.js';
  import Loader from '@lucide/svelte/icons/loader';
  import type { ComponentProps } from 'svelte';

  type Props = ComponentProps<typeof Loader>;

  let { class: className, ...restProps }: Props = $props();
</script>

<Loader role="status" aria-label="Loading" class={cn('animate-spin', className)} {...restProps} />
