<script lang="ts">
  import * as Tabs from '$lib/components/ui/tabs/index.js';
  import FinalMatches from './final-match.svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import { RefreshCwIcon } from '@lucide/svelte/icons';

  import TeamCard from '../cards/teams-card.svelte';
  import MatchesCard from '../cards/matches-card.svelte';
  import StandingsCard from '../cards/standings-card.svelte';

  import { formateDate } from '$lib/utils';
  import { goto } from '$app/navigation';
  import { handleUserErrors, withErrorHandling } from '$lib';
  import { onMount } from 'svelte';
  import { page } from '$app/state';

  import type { PageData } from './$types';
  import type { ApiResponse } from '$lib/types';
  import type { MatchSeriesWithDetails } from '$lib/server/db/types';
  import NotAvailableBanner from '$lib/components/not-available-banner.svelte';
  import HeadingCreator from '$lib/components/heading-creator.svelte';

  const { tournaments } = page.data as PageData;
  const tournamentSlug = page.params.slug;

  const validTabs = ['teams', 'matches', 'standings'];

  let matches = $state<MatchSeriesWithDetails[]>([]);
  let isLoadingMatches = $state<boolean>(true);

  const currentTournament = $derived(tournaments.find((t) => t.slug === tournamentSlug));

  const semiFinals = $derived(matches.filter((m) => m.type === 'SEMIFINAL'));
  const finals = $derived(matches.filter((m) => m.type === 'FINAL'));

  let activeTab = $derived.by(() => {
    return page.url.searchParams.get('tab') || '';
  });

  function onTabChange(newTab: string) {
    try {
      localStorage.setItem('activeTournamentTab', newTab);
    } catch {
      // ignore
    }
    const url = new URL(page.url);
    url.searchParams.set('tab', newTab);
    goto(url.pathname + url.search, { replaceState: true, keepFocus: true, noScroll: true });
  }

  const getFinalMatches = async () => {
    if (!currentTournament) return;

    isLoadingMatches = true;
    await withErrorHandling(async () => {
      const response = await fetch(`/api/match-series?tournamentId=${currentTournament.id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      const data: ApiResponse<MatchSeriesWithDetails[]> = await response.json();
      if (data.success) {
        matches = data.data;
      } else {
        handleUserErrors(data.error);
      }
    }, `Error getting matches for ${currentTournament.name}.`);
    isLoadingMatches = false;
  };

  const handleSetTabValue = () => {
    let tabFromUrl = null;
    try {
      tabFromUrl = page.url.searchParams.get('tab');
      tabFromUrl = localStorage.getItem('activeTournamentTab');
    } catch {
      // ignore
    }

    if (tabFromUrl && validTabs.includes(tabFromUrl)) {
      onTabChange(tabFromUrl);
    } else {
      onTabChange('matches');
    }
  };

  onMount(() => {
    handleSetTabValue();
    getFinalMatches();
  });
</script>

{#if !currentTournament || !tournamentSlug}
  <NotAvailableBanner
    title="Tournament not found"
    description="Please check the tournament slug or try again later."
  />
{:else}
  <section class="space-y-8">
    <HeadingCreator
      title={currentTournament.name}
      description={`${formateDate(currentTournament.startDate, 'No Start Date')} — ${formateDate(currentTournament.endDate, 'No End Date')}`}
    >
      {#if matches.length > 0}
        <Button variant="outline" size="icon" disabled={isLoadingMatches} onclick={getFinalMatches}>
          <RefreshCwIcon class={{ 'animate-spin': isLoadingMatches }} />
        </Button>
      {/if}</HeadingCreator
    >
    {#if matches.length > 0}
      <section class="space-y-4">
        <div>
          <h3 class="mb-2 text-lg font-semibold">Semifinals</h3>
          {#if semiFinals.length > 0}
            <FinalMatches matches={semiFinals} />
          {:else}
            <p class="text-center text-muted-foreground">To be announced.</p>
          {/if}
        </div>

        <div>
          <h3 class="mb-2 text-lg font-semibold">Final</h3>
          {#if finals.length > 0}
            <FinalMatches matches={finals} />
          {:else}
            <p class="text-center text-muted-foreground">To be announced.</p>
          {/if}
        </div>
      </section>
    {/if}

    <section>
      <Tabs.Root value={activeTab} class="w-full" onValueChange={onTabChange}>
        <Tabs.List class="w-full" aria-label="Manage Tournament Tabs">
          <Tabs.Trigger value="teams">Teams</Tabs.Trigger>
          <Tabs.Trigger value="matches">Matches</Tabs.Trigger>
          <Tabs.Trigger value="standings">Standings</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="teams">
          <TeamCard tournamentId={currentTournament.id} isActive={activeTab === 'teams'} />
        </Tabs.Content>
        <Tabs.Content value="matches">
          <MatchesCard tournamentId={currentTournament.id} isActive={activeTab === 'matches'} />
        </Tabs.Content>
        <Tabs.Content value="standings">
          <StandingsCard tournamentId={currentTournament.id} isActive={activeTab === 'standings'} />
        </Tabs.Content>
      </Tabs.Root>
    </section>
  </section>
{/if}
