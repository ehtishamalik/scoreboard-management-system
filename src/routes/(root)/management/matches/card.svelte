<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';

	import Label from '$lib/components/ui/label/label.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import GenerateMatches from './generate-matches.svelte';

	import CloseIcon from '@lucide/svelte/icons/circle-x';
	import SaveIcon from '@lucide/svelte/icons/save';
	import RefreshIcon from '@lucide/svelte/icons/refresh-cw';
	import Loader from '@lucide/svelte/icons/loader';
	import GripHorizontal from '@lucide/svelte/icons/grip-horizontal';
	import EditMatch from './edit-match.svelte';

	import { Switch } from '$lib/components/ui/switch';
	import { Input } from '$lib/components/ui/input/index.js';
	import { getMatchWinner, handleUserErrors, withErrorHandling } from '$lib';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { formateDate } from '$lib/utils';

	import type {
		MatchInsertModel,
		MatchWithDetails,
		TournamentSelectModel
	} from '$lib/server/db/types';
	import type { ApiResponse } from '$lib/types';

	let {
		tournament
	}: {
		tournament: TournamentSelectModel;
	} = $props();

	let matches = $state<MatchWithDetails[]>([]);
	let matchesWithDateMap = $state<Record<string, string>>({});
	let matchesSearch = $state<string>('');
	let isSwitchChecked = $state<boolean>(true);
	let isLoading = $state<boolean>(true);
	let isAlertOpen = $state<boolean>(false);
	let selectedIndex: number | null = $state(null);

	let isUpdatingMatch = $state<boolean>(false);

	const filteredMatches = $derived(
		matchesSearch.trim().length === 0
			? matches
			: matches.filter((m) => {
					const terms = matchesSearch.toLowerCase().split(/\s+/).filter(Boolean);
					const combined = `${m.team1.name} ${m.team2.name}`.toLowerCase();
					return terms.every((t) => combined.includes(t));
				})
	);

	const isDragActive = $derived(!matchesSearch.trim());

	function onSelectRow(index: number) {
		if (selectedIndex === null) {
			// first click → select this row
			selectedIndex = index;
		} else {
			// second click → perform action
			if (isSwitchChecked) {
				swapRows(selectedIndex, index);
			} else {
				moveRow(selectedIndex, index);
			}
			selectedIndex = null; // reset selection
		}
	}

	const handleReorder = (newMatches: MatchWithDetails[]) => {
		matches = newMatches.map((match, index) => {
			if (matchesWithDateMap[index]) {
				return { ...match, playDate: matchesWithDateMap[index] };
			}
			return match;
		});
	};

	function swapRows(i: number, j: number) {
		if (i === j) return;

		const updated = [...matches];
		[updated[i], updated[j]] = [updated[j], updated[i]];
		handleReorder(updated);
	}

	function moveRow(from: number, to: number) {
		if (from === to) return;

		const updated = [...matches];
		const [removed] = updated.splice(from, 1);
		updated.splice(to, 0, removed);
		handleReorder(updated);
	}

	const getAllMatches = async () => {
		isLoading = true;
		await withErrorHandling(async () => {
			const response = await fetch(`/api/matches?tournamentId=${tournament.id}`, {
				method: 'GET',
				headers: { 'Content-Type': 'application/json' }
			});

			const data: ApiResponse<MatchWithDetails[]> = await response.json();
			if (data.success) {
				matches = data.data.map((match) => ({
					...match,
					winnerId: ''
				}));
				matchesWithDateMap = {};
				matches.forEach((match, index) => {
					if (match.playDate) {
						const dateKey = new Date(match.playDate).toISOString().split('T')[0];
						matchesWithDateMap[index] = dateKey;
					}
				});
			} else {
				handleUserErrors(data.error);
			}
		}, `Error fetching matches for ${tournament.name}`);
		isLoading = false;
	};

	const handleSave = async () => {
		const insertMatch: MatchInsertModel[] = matches.map((match) => ({
			id: match.id,
			tournamentId: match.tournamentId,
			team1Id: match.team1Id,
			team2Id: match.team2Id,
			team1Points: match.team1Points || 0,
			team2Points: match.team2Points || 0,
			winnerId: getMatchWinner(match, true),
			playDate: match.playDate
		}));

		isUpdatingMatch = true;
		isAlertOpen = false;
		await withErrorHandling(async () => {
			const response = await fetch(`/api/matches/bulk`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(insertMatch)
			});

			const data: ApiResponse<null> = await response.json();
			if (data.success) {
				toast.success('Match updated successfully');
				getAllMatches();
			} else {
				handleUserErrors(data.error);
			}
		}, 'Error updating match');
		isUpdatingMatch = false;
	};

	onMount(() => {
		getAllMatches();
	});
</script>

<Card.Root class="transition-all">
	<Card.Header>
		<Card.Title class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
			<h2 class="text-xl">{tournament.name}</h2>
			<div class="ml-auto flex items-center gap-2">
				{#if !isLoading}
					<GenerateMatches {tournament} matchesLength={matches.length} callback={getAllMatches} />
				{/if}
				<Button variant="outline" size="icon" disabled={isLoading} onclick={getAllMatches}>
					<RefreshIcon class={{ 'animate-spin': isLoading }} />
				</Button>

				<AlertDialog.Root open={isAlertOpen} onOpenChange={(open) => (isAlertOpen = open)}>
					<AlertDialog.Trigger>
						{#snippet child({ props })}
							<Button {...props} variant="outline" size="icon" disabled={isUpdatingMatch}>
								{#if isUpdatingMatch}
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
								This action will save all the changes made to the matches. This action cannot be
								undone. Please make sure you have reviewed all changes before proceeding.
							</AlertDialog.Description>
						</AlertDialog.Header>
						<AlertDialog.Footer>
							<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
							<AlertDialog.Action onclick={handleSave}>Continue</AlertDialog.Action>
						</AlertDialog.Footer>
					</AlertDialog.Content>
				</AlertDialog.Root>
			</div>
		</Card.Title>
		<Card.Description class="my-4 grid grid-cols-1 justify-between gap-4 sm:grid-cols-2">
			<p>Total Matches: {isLoading ? 'counting...' : filteredMatches.length}</p>
			<div class="flex items-center justify-end gap-2">
				<Label for="dragType" class="mr-2">
					{#if selectedIndex !== null}
						Click on another row to {isSwitchChecked ? 'swap' : 'insert'}
					{:else}
						{isSwitchChecked ? 'Swap' : 'Insert'} mode (Click on the grag icon to select a row)
					{/if}
				</Label>
				<Switch id="dragType" bind:checked={isSwitchChecked} />
			</div>
			<div class="flex items-center gap-2">
				<Input bind:value={matchesSearch} placeholder="Filter matches using team name." />
				<Button
					variant="secondary"
					size="icon"
					onclick={() => (matchesSearch = '')}
					disabled={matchesSearch.trim() === ''}
				>
					<CloseIcon />
				</Button>
			</div>
		</Card.Description>
	</Card.Header>
	<Card.Footer>
		<Table.Root>
			{#if isLoading}
				<Table.Caption>Loading....</Table.Caption>
			{:else if filteredMatches.length === 0}
				<Table.Caption>No matches found.</Table.Caption>
			{/if}
			<Table.Header>
				<Table.Row>
					{#if isDragActive}
						<Table.Head class="w-9">
							<GripHorizontal class="size-5" />
						</Table.Head>
					{/if}
					<Table.Head class="w-9">#</Table.Head>
					<Table.Head>Team One</Table.Head>
					<Table.Head class="w-24">Points</Table.Head>
					<Table.Head>Team Two</Table.Head>
					<Table.Head class="w-24">Points</Table.Head>
					<Table.Head>Winner</Table.Head>
					<Table.Head>Play Date</Table.Head>
					<Table.Head class="w-24 text-right">Action</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each filteredMatches as match, index (match.id)}
					<Table.Row
						class={{ 'relative transition-colors': true, 'bg-muted': selectedIndex === index }}
					>
						{#if isDragActive}
							<Table.Cell class="font-medium">
								<GripHorizontal class="size-5 cursor-pointer" onclick={() => onSelectRow(index)} />
							</Table.Cell>
						{/if}

						<Table.Cell class="font-medium">{index + 1}</Table.Cell>
						<Table.Cell>{match.team1.name}</Table.Cell>
						<Table.Cell>{match.team1Points}</Table.Cell>
						<Table.Cell>{match.team2.name}</Table.Cell>
						<Table.Cell>{match.team2Points}</Table.Cell>
						<Table.Cell>{getMatchWinner(match, false)}</Table.Cell>
						<Table.Cell>{formateDate(match.playDate)}</Table.Cell>
						<Table.Cell class="text-right"><EditMatch {match} /></Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</Card.Footer>
</Card.Root>
