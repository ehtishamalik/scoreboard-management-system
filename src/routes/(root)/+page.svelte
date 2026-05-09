<script lang="ts">
  import TournamentCard from './tournament-card.svelte';
  import HeadingCreator from '$lib/components/heading-creator.svelte';
  import NotAvailableBanner from '$lib/components/not-available-banner.svelte';
  import Badge from '$lib/components/ui/badge/badge.svelte';
  import CompleteTournamentCard from '$lib/components/complete-tournament-card.svelte';

  import { page } from '$app/state';

  import type { PageData } from './$types';

  const { session, tournaments } = page.data as PageData;

  const activeTournaments = $derived(tournaments.filter((t) => t.isActive));
  const completedTournaments = $derived(tournaments.filter((t) => !t.isActive));
</script>

<section class="space-y-12 pb-12">
  <HeadingCreator
    title="Welcome, {session?.user.name || 'Guest'}"
    description="Explore and participate in active tournaments."
  />

  <!-- Active Tournaments Section -->
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <HeadingCreator title="Active Tournaments" description="Live and upcoming events" type="h2" />
      {#if activeTournaments.length > 0}
        <Badge variant="secondary" class="border-chart-2/20 bg-chart-2/10 text-chart-2">
          {activeTournaments.length} Live
        </Badge>
      {/if}
    </div>

    {#if activeTournaments.length === 0}
      <NotAvailableBanner
        title="No active tournaments available at the moment."
        description="Please check back later for upcoming tournaments."
      />
    {:else}
      <section class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-2">
        {#each activeTournaments as tournament (tournament.id)}
          <TournamentCard {tournament} {session} />
        {/each}
      </section>
    {/if}
  </div>

  <!-- Completed Tournaments Section -->
  {#if completedTournaments.length > 0}
    <div class="space-y-6 pt-6">
      <HeadingCreator title="Completed Tournaments" description="Hall of Fame" type="h2" />

      <section class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {#each completedTournaments as tournament (tournament.id)}
          <CompleteTournamentCard {tournament} />
        {/each}
      </section>
    </div>
  {/if}
</section>
