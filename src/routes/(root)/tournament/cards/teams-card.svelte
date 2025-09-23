<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import RefreshIcon from '@lucide/svelte/icons/refresh-cw';
	import Button from '$lib/components/ui/button/button.svelte';

	import { handleUserErrors, withErrorHandling } from '$lib';

	import type { TeamWithPlayers } from '$lib/server/db/types';
	import type { ApiResponse } from '$lib/types';

	let {
		tournamentId,
		isActive = false
	}: {
		tournamentId: string;
		isActive?: boolean;
	} = $props();

	let teams = $state<TeamWithPlayers[]>([]);

	let isLoading = $state<boolean>(true);
	let loadedAlready = $state<boolean>(false);

	const getAllTeams = async () => {
		isLoading = true;
		await withErrorHandling(async () => {
			const response = await fetch(`/api/teams?tournamentId=${tournamentId}`, {
				method: 'GET',
				headers: { 'Content-Type': 'application/json' }
			});

			const data: ApiResponse<TeamWithPlayers[]> = await response.json();
			if (data.success) {
				teams = data.data;
			} else {
				handleUserErrors(data.error);
			}
		}, 'Error fetching teams');
		isLoading = false;
	};

	$effect(() => {
		if (isActive && !loadedAlready) {
			getAllTeams();
			loadedAlready = true;
		}
	});
</script>

<Card.Root class="transition-all">
	<Card.Header>
		<Card.Title class="flex items-center justify-between gap-4">
			<h1 class="text-2xl">Teams</h1>
			<Button variant="outline" size="icon" disabled={isLoading} onclick={getAllTeams}>
				<RefreshIcon class={{ 'animate-spin': isLoading }} />
			</Button>
		</Card.Title>
		<Card.Description class="flex flex-col gap-1">
			<p>Total Teams: {isLoading ? 'counting...' : teams.length}</p>
		</Card.Description>
	</Card.Header>
	<Card.Content>
		<Table.Root>
			{#if isLoading}
				<Table.Caption>Loading....</Table.Caption>
			{:else if teams.length === 0}
				<Table.Caption>No team created yet.</Table.Caption>
			{/if}
			<Table.Header>
				<Table.Row>
					<Table.Head class="w-8">#</Table.Head>
					<Table.Head>Team Name</Table.Head>
					<Table.Head>Player Primary</Table.Head>
					<Table.Head>Player Secondary</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each teams as { id, name, participationPlayerOne, participationPlayerTwo }, index (id)}
					<Table.Row>
						<Table.Cell>
							{index + 1}</Table.Cell
						>
						<Table.Cell>{name}</Table.Cell>
						<Table.Cell>{participationPlayerOne.user.name}</Table.Cell>
						<Table.Cell>{participationPlayerTwo.user.name}</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</Card.Content>
</Card.Root>
