<script lang="ts">
	import MatchTable from '$lib/components/match-table.svelte';
	import RefreshIcon from '@lucide/svelte/icons/refresh-cw';
	import Button from '$lib/components/ui/button/button.svelte';

	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { handleUserErrors, withErrorHandling } from '$lib';

	import type { MatchWithDetails } from '$lib/server/db/types';
	import type { ApiResponse } from '$lib/types';

	const teamId = page.params.id;

	let matches = $state<MatchWithDetails[]>([]);
	let isLoading = $state<boolean>(true);

	const teamName = $derived(
		matches.length > 0
			? matches[0].team1Id === teamId
				? matches[0].team1.name
				: matches[0].team2.name
			: null
	);

	const getMatches = async () => {
		isLoading = true;
		await withErrorHandling(async () => {
			const response = await fetch(`/api/matches?teamId=${teamId}`, {
				method: 'GET',
				headers: { 'Content-Type': 'application/json' }
			});

			const data: ApiResponse<MatchWithDetails[]> = await response.json();
			if (data.success) {
				matches = data.data;
			} else {
				handleUserErrors(data.error);
			}
		}, `Error fetching matches`);
		isLoading = false;
	};

	onMount(() => {
		getMatches();
	});
</script>

<section>
	<header class="mb-2 flex items-center justify-between gap-4">
		<h1 class="text-2xl font-bold">{teamName ? `Matches for ${teamName}` : 'Matches'}</h1>
		<Button variant="outline" size="icon" disabled={isLoading} onclick={getMatches}>
			<RefreshIcon class={{ 'animate-spin': isLoading }} />
		</Button>
	</header>
	<p class="mb-8">Total Matches: {isLoading ? 'counting...' : matches.length}</p>
	<MatchTable {matches} {isLoading} />
</section>
