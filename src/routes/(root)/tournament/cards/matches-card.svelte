<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import RefreshIcon from '@lucide/svelte/icons/refresh-cw';
	import CloseIcon from '@lucide/svelte/icons/circle-x';
	import Button from '$lib/components/ui/button/button.svelte';
	import MatchTable from '$lib/components/match-table.svelte';
	import Input from '$lib/components/ui/input/input.svelte';

	import { handleUserErrors, withErrorHandling } from '$lib';

	import type { MatchWithDetails } from '$lib/server/db/types';
	import type { ApiResponse } from '$lib/types';

	let {
		tournamentId,
		isActive = false
	}: {
		tournamentId: string;
		isActive?: boolean;
	} = $props();

	let matches = $state<MatchWithDetails[]>([]);
	let matchesSearch = $state<string>('');

	let loadedAlready = $state<boolean>(false);
	let isLoading = $state<boolean>(true);

	const filteredMatches = $derived(
		matchesSearch.trim().length === 0
			? matches
			: matches.filter((m) => {
					const search = matchesSearch.toLowerCase().trim();
					if (search.includes(':winner')) {
						const winnerTerm = search.split(':')[0].trim();
						if (!winnerTerm.trim()) return true; // if only ":winner" typed, don't filter out everything
						return (m.winner?.name ?? '').toLowerCase().includes(winnerTerm);
					}

					const terms = search.split(/\s+/).filter(Boolean);
					const combined = `${m.team1.name} ${m.team2.name} ${m.winner?.name ?? ''}`.toLowerCase();
					return terms.every((t) => combined.includes(t));
				})
	);

	const teamClickCallback = (teamName: string) => {
		matchesSearch = teamName;
	};

	const getAllMatches = async () => {
		isLoading = true;
		await withErrorHandling(async () => {
			const response = await fetch(`/api/matches?tournamentId=${tournamentId}`, {
				method: 'GET',
				headers: { 'Content-Type': 'application/json' }
			});

			const data: ApiResponse<MatchWithDetails[]> = await response.json();
			if (data.success) {
				matches = data.data;
			} else {
				handleUserErrors(data.error);
			}
		}, 'Error fetching teams');
		isLoading = false;
	};

	$effect(() => {
		if (isActive && !loadedAlready) {
			getAllMatches();
			loadedAlready = true;
		}
	});
</script>

<Card.Root class="transition-all">
	<Card.Header>
		<Card.Title class="flex items-center justify-between gap-4">
			<h1 class="text-2xl">Matches</h1>
			<Button variant="outline" size="icon" disabled={isLoading} onclick={getAllMatches}>
				<RefreshIcon class={{ 'animate-spin': isLoading }} />
			</Button>
		</Card.Title>
		<Card.Description class="flex flex-col gap-4">
			<p>Total Matches: {isLoading ? 'counting...' : filteredMatches.length}</p>
			<div class="flex w-full max-w-xl items-center gap-2">
				<Input
					bind:value={matchesSearch}
					placeholder="Filter matches using team names or winner (e.g., TeamName:winner)"
				/>
				<Button
					variant="ghost"
					size="icon"
					onclick={() => (matchesSearch = '')}
					disabled={matchesSearch.trim() === ''}
				>
					<CloseIcon />
				</Button>
			</div>
		</Card.Description>
	</Card.Header>
	<Card.Content>
		<MatchTable matches={filteredMatches} {isLoading} {teamClickCallback} />
	</Card.Content>
</Card.Root>
