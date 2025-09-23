<script lang="ts">
	import * as Table from '$lib/components/ui/table/index.js';

	import { formateDate } from '$lib/utils';

	import type { MatchWithDetails } from '$lib/server/db/types';

	let {
		matches,
		isLoading = false,
		teamClickCallback
	}: {
		matches: MatchWithDetails[];
		isLoading?: boolean;
		teamClickCallback?: (teamName: string) => void;
	} = $props();

	const handleTeamClick = (teamName: string) => {
		if (teamClickCallback) {
			teamClickCallback(teamName);
		}
	};
</script>

<Table.Root>
	{#if isLoading}
		<Table.Caption>Loading....</Table.Caption>
	{:else if matches.length === 0}
		<Table.Caption>No match created yet.</Table.Caption>
	{/if}
	<Table.Header>
		<Table.Row>
			<Table.Head class="w-8">#</Table.Head>
			<Table.Head>Team One</Table.Head>
			<Table.Head>Points</Table.Head>
			<Table.Head>Team Two</Table.Head>
			<Table.Head>Points</Table.Head>
			<Table.Head>Winner</Table.Head>
			<Table.Head>Play Date</Table.Head>
		</Table.Row>
	</Table.Header>
	<Table.Body>
		{#each matches as { id, playDate, team1, team2, team1Points, team2Points, winner, team1Id, team2Id, winnerId }, index (id)}
			<Table.Row>
				<Table.Cell>
					{index + 1}</Table.Cell
				>
				<Table.Cell
					class={{ 'cursor-pointer': true, 'text-emerald-600': winnerId === team1Id }}
					title={`Search by ${team1.name}`}
					onclick={() => handleTeamClick(team1.name)}>{team1.name}</Table.Cell
				>
				<Table.Cell>{team1Points}</Table.Cell>
				<Table.Cell
					class={{ 'cursor-pointer': true, 'text-emerald-600': winnerId === team2Id }}
					title={`Search by ${team2.name}`}
					onclick={() => handleTeamClick(team2.name)}>{team2.name}</Table.Cell
				>
				<Table.Cell>{team2Points}</Table.Cell>
				<Table.Cell class={{ 'text-pink-800': !winnerId }}
					>{winner?.name || 'No winner yet'}</Table.Cell
				>
				<Table.Cell>{formateDate(playDate)}</Table.Cell>
			</Table.Row>
		{/each}
	</Table.Body>
</Table.Root>
