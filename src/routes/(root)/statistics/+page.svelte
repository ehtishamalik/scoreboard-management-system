<script lang="ts">
  import PerformanceStats from '$lib/components/dashboard/performance-stats.svelte';

  import { page } from '$app/state';

  import type { PageData } from './$types';
  import NotAvailableBanner from '$lib/components/not-available-banner.svelte';

  const { session } = page.data as PageData;
</script>

{#if session}
  <PerformanceStats />
{:else}
  <NotAvailableBanner title="Statistics" description="Please login to view statistics" />
{/if}
