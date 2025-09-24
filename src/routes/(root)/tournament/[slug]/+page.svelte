<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import MatchTable from '$lib/components/match-table.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import RefreshIcon from '@lucide/svelte/icons/refresh-cw';

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
	import type { MatchWithDetails } from '$lib/server/db/types';

	const { tournaments } = page.data as PageData;
	const tournamentSlug = page.params.slug;

	const validTabs = ['teams', 'matches', 'standings'];

	let matches = $state<MatchWithDetails[]>([]);
	let isLoadingMatches = $state<boolean>(true);

	const currentTournament = $derived(tournaments.find((t) => t.slug === tournamentSlug));

	const semiFinals = $derived(matches.filter((m) => m.type === 'SEMIFINAL'));
	const finals = $derived(matches.filter((m) => m.type === 'FINAL'));

	let activeTab = $derived.by(() => {
		const tabFromUrl = page.url.searchParams.get('tab');
		if (!tabFromUrl) {
			return 'teams';
		}
		return validTabs.includes(tabFromUrl) ? tabFromUrl : 'teams';
	});

	function onTabChange(newTab: string) {
		if (!validTabs.includes(newTab)) {
			newTab = 'teams';
		}
		const url = new URL(page.url);
		url.searchParams.set('tab', newTab);
		goto(url.pathname + url.search, { replaceState: true, keepFocus: true, noScroll: true });
	}

	const getFinalMatches = async () => {
		if (!currentTournament) return;

		isLoadingMatches = true;
		await withErrorHandling(async () => {
			const response = await fetch(
				`/api/matches?tournamentId=${currentTournament.id}&type=SEMIFINAL,FINAL`,
				{
					method: 'GET',
					headers: { 'Content-Type': 'application/json' }
				}
			);

			const data: ApiResponse<MatchWithDetails[]> = await response.json();
			if (data.success) {
				matches = data.data.map((match) => ({
					...match,
					winnerId: ''
				}));
			} else {
				handleUserErrors(data.error);
			}
		}, `Error getting matches for ${currentTournament.name}.`);
		isLoadingMatches = false;
	};

	onMount(() => {
		const tabFromUrl = page.url.searchParams.get('tab');
		if (!tabFromUrl) {
			page.url.searchParams.set('tab', 'teams');
			goto(page.url.pathname + page.url.search, {
				replaceState: true,
				keepFocus: true,
				noScroll: true
			});
		}
		getFinalMatches();
	});
</script>

{#if !currentTournament || !tournamentSlug}
	<header
		class="mb-12 flex flex-col items-center justify-center rounded-lg border border-dashed p-8"
	>
		<p class="mb-2 text-center text-lg text-muted-foreground">
			<em>Tournament not found.</em>
		</p>
		<p class="text-center text-sm text-muted-foreground">
			Please check the tournament slug or try again later.
		</p>
	</header>
{:else}
	<section class="space-y-12">
		<header>
			<div class="mb-2 flex items-center justify-between">
				<h1 class="text-2xl font-bold">{currentTournament.name}</h1>
				{#if matches.length > 0}
					<Button
						variant="outline"
						size="icon"
						disabled={isLoadingMatches}
						onclick={getFinalMatches}
					>
						<RefreshIcon class={{ 'animate-spin': isLoadingMatches }} />
					</Button>
				{/if}
			</div>
			<p class="text-muted-foreground">
				{currentTournament.startDate ? formateDate(currentTournament.startDate) : 'No Start Date'}
				—
				{currentTournament.endDate ? formateDate(currentTournament.endDate) : 'No End Date'}
			</p>
		</header>

		{#if matches.length > 0}
			<section class="space-y-8">
				<div>
					<h3 class="text-lg font-semibold">Semifinals</h3>
					{#if semiFinals.length > 0}
						<MatchTable matches={semiFinals} />
					{:else}
						<p class="text-center text-muted-foreground">To be announced.</p>
					{/if}
				</div>

				<div>
					<h3 class="text-lg font-semibold">Finals</h3>
					{#if finals.length > 0}
						<MatchTable matches={finals} />
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
