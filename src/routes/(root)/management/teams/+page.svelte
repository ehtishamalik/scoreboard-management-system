<script lang="ts">
  import * as Tabs from '$lib/components/ui/tabs/index.js';
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
    title="Manage Teams"
    description="Create or update teams in bulk. Each team must include a name and all players to be processed. Teams with missing data will be skipped and not saved."
    type="h1"
  />
  {#if activeFinalizedTournaments.length === 0}
    <NotAvailableBanner
      title="No active tournaments available at the moment."
      description="Please make sure the tournaments are created and finalized to manage teams."
    />
  {:else}
    <Tabs.Root value={activeFinalizedTournaments[0]?.id} class="w-full">
      <Tabs.List class="w-full">
        {#each activeFinalizedTournaments as tournament (tournament.id)}
          <Tabs.Trigger value={tournament.id}>{tournament.name}</Tabs.Trigger>
        {/each}
      </Tabs.List>
      {#each activeFinalizedTournaments as tournament (tournament.id)}
        <Tabs.Content value={tournament.id}>
          <Card {tournament} />
        </Tabs.Content>
      {/each}
    </Tabs.Root>
  {/if}
</section>
