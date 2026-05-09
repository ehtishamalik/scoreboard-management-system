<script lang="ts">
  import NotAvailableBanner from '$lib/components/not-available-banner.svelte';
  import HeadingCreator from '$lib/components/heading-creator.svelte';
  import Card from './card.svelte';

  import { page } from '$app/state';

  import type { PageData } from './$types';

  const { tournaments } = page.data as PageData;

  const activeFinalizedTournaments = $derived(
    tournaments.filter((t) => t.isActive && t.isFinalized)
  );
</script>

<section>
  <HeadingCreator
    title="Manage Participations"
    description="Manage team participations in your tournaments. Respective teams and matches will be removed upon deleting a participation."
  />

  {#if activeFinalizedTournaments.length === 0}
    <NotAvailableBanner
      title="No active tournaments available at the moment."
      description="Please make sure the tournaments are created and finalized to manage participations."
    />
  {:else}
    <section class="grid grid-cols-[repeat(auto-fit,minmax(350px,1fr))] gap-6">
      {#each activeFinalizedTournaments as tournament (tournament.id)}
        <Card {tournament} />
      {/each}
    </section>
  {/if}
</section>
