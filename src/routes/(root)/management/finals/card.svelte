<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import DatePicker from '$lib/components/date-picker.svelte';
	import AddMatch from './add-match.svelte';

	import Button from '$lib/components/ui/button/button.svelte';
	import SaveIcon from '@lucide/svelte/icons/save';
	import RefreshIcon from '@lucide/svelte/icons/refresh-cw';
	import TrashIcon from '@lucide/svelte/icons/trash-2';

	import { Input } from '$lib/components/ui/input/index.js';
	import { getMatchWinner, handleUserErrors, withErrorHandling } from '$lib';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	import type {
		MatchInsertModel,
		MatchSelectModel,
		MatchWithDetails,
		TournamentSelectModel
	} from '$lib/server/db/types';
	import type { ApiResponse, MatchType } from '$lib/types';

	let {
		tournament
	}: {
		tournament: TournamentSelectModel;
	} = $props();

	let matches = $state<MatchWithDetails[]>([]);
	let isLoadingMatches = $state<boolean>(true);

	let isUpdatingMatch = $state<boolean>(false);
	let isDeletingMatches = $state<boolean>(false);

	let isAlertDialogOpen = $state<boolean>(false);

	const getFinalMatches = async () => {
		isLoadingMatches = true;

		await withErrorHandling(async () => {
			const response = await fetch(
				`/api/matches?tournamentId=${tournament.id}&type=SEMIFINAL,FINAL`,
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
		}, `Error fetching matches for ${tournament.name}`);
		isLoadingMatches = false;
	};

	const handleDeleteMatch = async (match: MatchWithDetails) => {
		isAlertDialogOpen = false;
		isDeletingMatches = true;
		await withErrorHandling(async () => {
			const response = await fetch(`/api/matches/${match.id}`, {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' }
			});

			const data: ApiResponse<MatchSelectModel[]> = await response.json();
			if (data.success) {
				toast.success(`Matches deleted successfully for ${tournament.name}`);
				matches = matches.filter((m) => m.id !== match.id);
			} else {
				handleUserErrors(data.error);
			}
		}, `Error deleting matches for ${tournament.name}`);
		isDeletingMatches = false;
	};

	const updateMatch = async (match: MatchWithDetails) => {
		const insertMatch: MatchInsertModel = {
			tournamentId: match.tournamentId,
			team1Id: match.team1Id,
			team2Id: match.team2Id,
			team1Points: match.team1Points || 0,
			team2Points: match.team2Points || 0,
			winnerId: getMatchWinner(match, true),
			playDate: match.playDate,
			type: match.type
		};

		isUpdatingMatch = true;
		await withErrorHandling(async () => {
			const response = await fetch(`/api/matches/${match.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(insertMatch)
			});

			const data: ApiResponse<MatchSelectModel> = await response.json();
			if (data.success) {
				toast.success('Match updated successfully');
			} else {
				handleUserErrors(data.error);
			}
		}, 'Error updating match');
		isUpdatingMatch = false;
	};

	onMount(() => {
		getFinalMatches();
	});
</script>

<Card.Root class="transition-all">
	<Card.Header>
		<Card.Title class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
			<h2 class="text-xl">{tournament.name}</h2>
			<div class="ml-auto flex items-center gap-2">
				<AddMatch {tournament} callback={getFinalMatches} />
				<Button variant="outline" size="icon" disabled={isLoadingMatches} onclick={getFinalMatches}>
					<RefreshIcon class={{ 'animate-spin': isLoadingMatches }} />
				</Button>
			</div>
		</Card.Title>
		<Card.Description class="flex flex-col gap-4">
			<p>Total Matches: {isLoadingMatches ? 'counting...' : matches.length}</p>
		</Card.Description>
	</Card.Header>
	<Card.Footer>
		<Table.Root>
			{#if isLoadingMatches}
				<Table.Caption>Loading....</Table.Caption>
			{:else if matches.length === 0}
				<Table.Caption>No matches found.</Table.Caption>
			{/if}
			<Table.Header>
				<Table.Row>
					<Table.Head class="w-9">#</Table.Head>
					<Table.Head>Team One</Table.Head>
					<Table.Head class="w-24">Points</Table.Head>
					<Table.Head>Team Two</Table.Head>
					<Table.Head class="w-24">Points</Table.Head>
					<Table.Head>Winner</Table.Head>
					<Table.Head>Match</Table.Head>
					<Table.Head>Play Date</Table.Head>
					<Table.Head class="text-right">Action</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each matches as match, index (match.id)}
					<Table.Row>
						<Table.Cell class="font-medium">{index + 1}</Table.Cell>
						<Table.Cell>{match.team1.name}</Table.Cell>
						<Table.Cell>
							<Input bind:value={match.team1Points} type="number" class="w-24" />
						</Table.Cell>
						<Table.Cell>{match.team2.name}</Table.Cell>
						<Table.Cell>
							<Input bind:value={match.team2Points} type="number" class="w-24" />
						</Table.Cell>
						<Table.Cell class="w-48">
							{getMatchWinner(match, false)}
						</Table.Cell>
						<Table.Cell class="w-48">
							{match.type === 'SEMIFINAL' ? 'Semi Final' : 'Final'}
						</Table.Cell>
						<Table.Cell>
							<DatePicker
								placeholder="Play Date"
								value={match.playDate ? new Date(match.playDate) : null}
								onChange={(date) => {
									match.playDate = date ? date : '';
								}}
							/>
						</Table.Cell>
						<Table.Cell class="text-right">
							<Button
								variant="outline"
								size="icon"
								disabled={isUpdatingMatch}
								onclick={() => updateMatch(match)}
							>
								<SaveIcon />
							</Button>
							<AlertDialog.Root
								open={isAlertDialogOpen}
								onOpenChange={(open) => (isAlertDialogOpen = open)}
							>
								<AlertDialog.Trigger>
									{#snippet child({ props })}
										<Button
											{...props}
											variant="destructive"
											size="icon"
											disabled={isDeletingMatches}
										>
											<TrashIcon />
										</Button>
									{/snippet}
								</AlertDialog.Trigger>
								<AlertDialog.Content>
									<AlertDialog.Header>
										<AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
										<AlertDialog.Description>
											This action cannot be undone. This will permanently delete this match. You can
											create new one.
										</AlertDialog.Description>
									</AlertDialog.Header>
									<AlertDialog.Footer>
										<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
										<AlertDialog.Action onclick={() => handleDeleteMatch(match)}
											>Continue</AlertDialog.Action
										>
									</AlertDialog.Footer>
								</AlertDialog.Content>
							</AlertDialog.Root>
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</Card.Footer>
</Card.Root>
