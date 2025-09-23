<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import SearchSelect from '$lib/components/search-select.svelte';
	import Loader from '@lucide/svelte/icons/loader';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import SaveIcon from '@lucide/svelte/icons/save';
	import TrashIcon from '@lucide/svelte/icons/trash';
	import RefreshIcon from '@lucide/svelte/icons/refresh-cw';

	import { Input } from '$lib/components/ui/input/index.js';
	import { toast } from 'svelte-sonner';
	import { handleUserErrors, withErrorHandling } from '$lib';
	import { onMount } from 'svelte';

	import type {
		ParticipationsWithUsers,
		TeamsInsertModel,
		TeamsSelectModel,
		TeamWithPlayers,
		TournamentSelectModel
	} from '$lib/server/db/types';
	import type { ApiResponse } from '$lib/types';

	type TeamType = {
		name: string;
		playerOneId: string;
		playerTwoId: string;
		playerOneName: string;
		playerTwoName: string;
	};

	let props = $props();
	let tournament: TournamentSelectModel = $state(props.tournament);

	let participations = $state<ParticipationsWithUsers[]>([]);
	let teams = $state<TeamType[]>([]);

	let isLoading = $state<boolean>(true);
	let isSubmittingTeams = $state<boolean>(false);
	let isAlertDialogOpen = $state<boolean>(false);

	const nameMap = $derived(new Map(participations.map((p) => [p.id, p.user.name.split(' ')[0]])));

	const getAllParticipations = async () => {
		await withErrorHandling(async () => {
			const response = await fetch(`/api/participations?tournamentId=${tournament.id}`, {
				method: 'GET',
				headers: { 'Content-Type': 'application/json' }
			});

			const data: ApiResponse<ParticipationsWithUsers[]> = await response.json();
			if (data.success) {
				participations = data.data;
			} else {
				handleUserErrors(data.error);
			}
		}, `Error fetching participation for ${tournament.name}`);
	};

	const getAllTeams = async () => {
		await withErrorHandling(async () => {
			const response = await fetch(`/api/teams?tournamentId=${tournament.id}`, {
				method: 'GET',
				headers: { 'Content-Type': 'application/json' }
			});

			const data: ApiResponse<TeamWithPlayers[]> = await response.json();
			if (data.success) {
				teams = data.data.map((team) => ({
					name: team.name,
					playerOneId: team.participationPlayerOne.id,
					playerTwoId: team.participationPlayerTwo.id,
					playerOneName: team.participationPlayerOne.user.name,
					playerTwoName: team.participationPlayerTwo.user.name
				}));
			} else {
				handleUserErrors(data.error);
			}
		}, `Error fetching teams for ${tournament.name}`);
	};

	const handleSubmitTeams = async () => {
		isAlertDialogOpen = false;
		const teamToSubmit: TeamsInsertModel[] = [];
		teams.forEach((team) => {
			if (team.name && team.playerOneId && team.playerTwoId) {
				teamToSubmit.push({
					name: team.name.trim(),
					participationPlayerOne: team.playerOneId,
					participationPlayerTwo: team.playerTwoId,
					tournamentId: tournament.id
				});
			}
		});

		if (teamToSubmit.length === 0) {
			toast.error('No valid teams to submit. Please check team details.');
			return;
		}

		isSubmittingTeams = true;
		await withErrorHandling(async () => {
			const response = await fetch(`/api/teams/bulk`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },

				body: JSON.stringify(teamToSubmit)
			});

			const data: ApiResponse<TeamsSelectModel[]> = await response.json();
			if (data.success) {
				toast.success(`Successfully submitted ${teamToSubmit.length} teams for ${tournament.name}`);
			} else {
				handleUserErrors(data.error);
			}
		}, `Error submitting teams for ${tournament.name}`);
		isSubmittingTeams = false;
	};

	const handleAddTeam = () => {
		teams = [
			...teams,
			{ name: '', playerOneId: '', playerTwoId: '', playerOneName: '', playerTwoName: '' }
		];
	};

	const handleRemoveTeam = (index: number) => {
		teams = teams.filter((_, i) => i !== index);
	};

	const availableUsers = (excludeId: string | null = null) => {
		const selectedIds = teams.flatMap((t) => [t.playerOneId, t.playerTwoId]).filter(Boolean);
		return participations.filter((p) => !selectedIds.includes(p.id) || p.id === excludeId);
	};

	const remainingPlayerLength = $derived(availableUsers().length);

	const handleGetAllParticipations = async () => {
		isLoading = true;
		await getAllParticipations();
		isLoading = false;
	};

	onMount(async () => {
		isLoading = true;
		await Promise.all([getAllParticipations(), getAllTeams()]);
		isLoading = false;
	});
</script>

<Card.Root class="transition-all">
	<Card.Header>
		<Card.Title class="mb-2 flex items-center justify-between text-xl">
			<h2>{tournament.name}</h2>
			<div class="flex items-center gap-2">
				<Button
					variant="outline"
					size="icon"
					disabled={isLoading}
					onclick={handleGetAllParticipations}
				>
					<RefreshIcon class={{ 'animate-spin': isLoading }} />
				</Button>
				<Button
					variant="outline"
					size="icon"
					disabled={isLoading || remainingPlayerLength < 2}
					onclick={handleAddTeam}
				>
					<PlusIcon />
				</Button>
				<AlertDialog.Root
					open={isAlertDialogOpen}
					onOpenChange={(open) => (isAlertDialogOpen = open)}
				>
					<AlertDialog.Trigger>
						{#snippet child({ props })}
							<Button
								{...props}
								variant="default"
								size="icon"
								disabled={isSubmittingTeams || isLoading || teams.length === 0}
							>
								{#if isSubmittingTeams}
									<Loader class="animate-spin" />
								{:else}
									<SaveIcon />
								{/if}
							</Button>
						{/snippet}
					</AlertDialog.Trigger>
					<AlertDialog.Content>
						<AlertDialog.Header>
							<AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
							<AlertDialog.Description>
								Teams are stored in bulk. Continuing will delete the existing teams and their
								associated matches. New teams will be saved, and if matches were already generated,
								you'll need to regenerate them.
							</AlertDialog.Description>
						</AlertDialog.Header>
						<AlertDialog.Footer>
							<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
							<AlertDialog.Action onclick={handleSubmitTeams}>Continue</AlertDialog.Action>
						</AlertDialog.Footer>
					</AlertDialog.Content>
				</AlertDialog.Root>
			</div>
		</Card.Title>
		<Card.Description class="flex flex-col gap-1">
			<p>Total Participations: {participations.length}</p>
			<p>Remaining players: {remainingPlayerLength}</p>
		</Card.Description>
	</Card.Header>
	<Card.Content>
		<Table.Root>
			{#if teams.length === 0}
				<Table.Caption>No team created.</Table.Caption>
			{/if}
			<Table.Header>
				<Table.Row>
					<Table.Head class="w-8">#</Table.Head>
					<Table.Head>Team Name</Table.Head>
					<Table.Head>Player Primary</Table.Head>
					<Table.Head>Player Secondary</Table.Head>
					<Table.Head class="text-right">Action</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each teams as team, index (index)}
					<Table.Row>
						<Table.Cell class="font-medium">{index + 1}</Table.Cell>
						<Table.Cell>
							<Input
								bind:value={team.name}
								name="team-name"
								class="min-w-56"
								placeholder="Team Name"
							/>
						</Table.Cell>
						<Table.Cell>
							<SearchSelect
								bind:selected={team.playerOneId}
								onChange={(value) => {
									const playerOneName = nameMap.get(value);
									if (playerOneName) {
										team.name = 'Team ' + playerOneName.split(' ')[0];
									}
								}}
								items={availableUsers(team.playerOneId).map((player) => ({
									value: player.id,
									label: player.user.name
								}))}
							/>
						</Table.Cell>
						<Table.Cell>
							<SearchSelect
								bind:selected={team.playerTwoId}
								items={availableUsers(team.playerTwoId).map((player) => ({
									value: player.id,
									label: player.user.name
								}))}
							/>
						</Table.Cell>
						<Table.Cell class="text-right">
							<Button variant="destructive" size="icon" onclick={() => handleRemoveTeam(index)}>
								<TrashIcon />
							</Button>
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</Card.Content>
</Card.Root>
