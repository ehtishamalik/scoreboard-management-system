<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import DatePicker from '$lib/components/date-picker.svelte';

	import Label from '$lib/components/ui/label/label.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Loader from '@lucide/svelte/icons/loader';
	import PlusIcon from '@lucide/svelte/icons/plus';

	import { handleUserErrors, withErrorHandling } from '$lib';
	import { toast } from 'svelte-sonner';

	import type {
		MatchInsertModel,
		MatchSelectModel,
		TeamWithPlayers,
		TournamentSelectModel
	} from '$lib/server/db/types';
	import type { ApiResponse, MatchType } from '$lib/types';

	let {
		tournament,
		callback
	}: {
		tournament: TournamentSelectModel;
		callback: () => void;
	} = $props();

	let teams = $state<TeamWithPlayers[]>([]);
	let isLoadingTeams = $state<boolean>(false);

	let teamOne = $state<string>('');
	let teamTwo = $state<string>('');
	let matchDate = $state<string>('');
	let matchType = $state<MatchType>('SEMIFINAL');

	let isCreatingMatch = $state<boolean>(false);
	let isDialogOpen = $state<boolean>(false);

	const selectedTeamOne = $derived(
		teams.find((t) => t.id === teamOne)?.name || 'Select First Team'
	);

	const selectedTeamTwo = $derived(
		teams.find((t) => t.id === teamTwo)?.name || 'Select Second Team'
	);

	const isAddMatchButtonDisabled = $derived(
		isCreatingMatch || isLoadingTeams || !teamOne || !matchDate || !teamTwo || teamOne === teamTwo
	);

	const getAllTeams = async () => {
		isLoadingTeams = true;
		await withErrorHandling(async () => {
			const response = await fetch(`/api/teams?tournamentId=${tournament.id}`, {
				method: 'GET',
				headers: { 'Content-Type': 'application/json' }
			});

			const data: ApiResponse<TeamWithPlayers[]> = await response.json();
			if (data.success) {
				teams = data.data;
			} else {
				handleUserErrors(data.error);
			}
		}, `Error getting teams for ${tournament.name}`);
		isLoadingTeams = false;
	};

	const handleCreateMatch = async (event: Event) => {
		event.preventDefault();
		isDialogOpen = false;

		const insertMatch: MatchInsertModel = {
			tournamentId: tournament.id,
			team1Id: teamOne,
			team2Id: teamTwo,
			team1Points: 0,
			team2Points: 0,
			type: matchType,
			playDate: matchDate
		};

		isCreatingMatch = true;
		await withErrorHandling(async () => {
			const response = await fetch(`/api/matches`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(insertMatch)
			});

			const data: ApiResponse<MatchSelectModel> = await response.json();
			if (data.success) {
				toast.success('Match created successfully');
				teamOne = '';
				teamTwo = '';
				matchDate = '';
				matchType = 'SEMIFINAL';
				callback();
			} else {
				handleUserErrors(data.error);
			}
		}, 'Error creating match');
		isCreatingMatch = false;
	};

	const availableTeams = (excludeId: string) => {
		if (!excludeId) return teams;
		return teams.filter((t) => t.id !== excludeId);
	};

	$effect(() => {
		if (isDialogOpen) {
			getAllTeams();
		}
	});
</script>

<Dialog.Root open={isDialogOpen} onOpenChange={() => (isDialogOpen = !isDialogOpen)}>
	<Dialog.Trigger>
		{#snippet child({ props })}
			<Button {...props} size="sm">
				{#if isCreatingMatch}
					<Loader class="animate-spin" />
				{:else}
					<PlusIcon />
				{/if}
			</Button>
		{/snippet}
	</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Generate Default Random Matches</Dialog.Title>
			<Dialog.Description>
				All the previously existing matches will be deleted and new matches will be generated
				randomly.
			</Dialog.Description>
			<form class="my-2 space-y-4" onsubmit={handleCreateMatch}>
				<div class="space-y-2">
					<Label for="team-one">Team One</Label>
					<Select.Root type="single" name="team1" bind:value={teamOne}>
						<Select.Trigger id="team-one" class="w-full">{selectedTeamOne}</Select.Trigger>
						<Select.Content>
							{#each availableTeams(teamTwo) as { id, name } (id)}
								<Select.Item value={id}>{name}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
				<div class="space-y-2">
					<Label for="team-two">Team Two</Label>
					<Select.Root type="single" name="team2" bind:value={teamTwo}>
						<Select.Trigger id="team-two" class="w-full">{selectedTeamTwo}</Select.Trigger>
						<Select.Content>
							{#each availableTeams(teamOne) as { id, name } (id)}
								<Select.Item value={id}>{name}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
				<div class="space-y-2">
					<Label for="match-type">Type</Label>
					<Select.Root type="single" name="type" bind:value={matchType}>
						<Select.Trigger id="match-type" class="w-full"
							>{matchType === 'SEMIFINAL' ? 'Semi Final' : 'Final'}</Select.Trigger
						>
						<Select.Content>
							<Select.Item value="SEMIFINAL">Semi Final</Select.Item>
							<Select.Item value="FINAL">Final</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>
				<div class="space-y-2">
					<Label for="match-date">Play Date</Label>
					<DatePicker
						id="match-date"
						placeholder="Play Date"
						value={matchDate ? new Date(matchDate) : null}
						onChange={(date) => {
							matchDate = date ? date : '';
						}}
					/>
				</div>
				<Button class="w-full" type="submit" disabled={isAddMatchButtonDisabled}>
					{#if isLoadingTeams}
						<Loader class="animate-spin" />
						Loading Teams...
					{:else}
						<PlusIcon />
						Add Match
					{/if}
				</Button>
			</form>
		</Dialog.Header>
	</Dialog.Content>
</Dialog.Root>
