<script lang="ts">
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import DatePicker from '$lib/components/date-picker.svelte';
	import Loader from '@lucide/svelte/icons/loader';

	import { toast } from 'svelte-sonner';
	import { formateDate } from '$lib/utils';
	import { handleUserErrors, withErrorHandling } from '$lib';

	import type { TournamentInsertModel, TournamentSelectModel } from '$lib/server/db/types';
	import type { ApiResponse } from '$lib/types';

	let props = $props();
	let tournament: TournamentSelectModel = $state(props.tournament);

	let isLoadingDate: boolean = $state(false);
	let isLoadingFinalize: boolean = $state(false);
	let isLoadingComplete: boolean = $state(false);

	let isCompleteAlertOpen: boolean = $state(false);
	let isFinalizeAlertOpen: boolean = $state(false);

	const handleTournamentChange = async (newTournament: TournamentInsertModel) => {
		await withErrorHandling(async () => {
			const response = await fetch(`/api/tournaments/${tournament.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },

				body: JSON.stringify(newTournament)
			});

			const data: ApiResponse<TournamentSelectModel> = await response.json();
			if (data.success) {
				tournament = data.data;
			} else {
				handleUserErrors(data.error);
				tournament = tournament;
			}
		}, `Error updating tournament ${tournament.name}`);
	};

	const handleStartDateChange = async (date: string | null) => {
		const newTournament: TournamentInsertModel = {
			...tournament,
			startDate: date,
			endDate: null // Reset end date when start date changes
		};
		isLoadingDate = true;
		await handleTournamentChange(newTournament);
		isLoadingDate = false;
	};

	const handleEndDateChange = async (date: string | null) => {
		const newTournament: TournamentInsertModel = {
			...tournament,
			endDate: date
		};
		isLoadingDate = true;
		await handleTournamentChange(newTournament);
		isLoadingDate = false;
	};

	const handleFinalize = async () => {
		isFinalizeAlertOpen = false;
		const newTournament: TournamentInsertModel = {
			...tournament,
			isFinalized: true
		};
		isLoadingFinalize = true;
		await handleTournamentChange(newTournament);
		isLoadingFinalize = false;
	};

	const handleComplete = async () => {
		isCompleteAlertOpen = false;
		const newTournament: TournamentInsertModel = {
			...tournament,
			isActive: false
		};
		isLoadingComplete = true;
		await handleTournamentChange(newTournament);
		isLoadingComplete = false;
	};

	const handleCompleteAlert = () => {
		if (!tournament.startDate || !tournament.endDate) {
			toast.error('Cannot complete tournament', {
				description: 'Start date and end date must be set before completing tournament.'
			});
			return;
		}

		if (!tournament.isFinalized) {
			toast.error('Cannot complete tournament', {
				description: 'Tournament must be finalized before completing.'
			});
			return;
		}

		isCompleteAlertOpen = true;
	};
</script>

<Card.Root>
	<Card.Header>
		<Card.Title class="mb-2 text-xl">{tournament.name}</Card.Title>
		{#if tournament.isActive}
			<Card.Description
				class="flex flex-col items-start gap-4 sm:max-w-md sm:flex-row sm:items-center"
				><DatePicker
					placeholder="Start Date"
					value={tournament.startDate ? new Date(tournament.startDate) : null}
					isLoading={isLoadingDate}
					onChange={handleStartDateChange}
				/> <span class="hidden sm:inline">—</span>
				{#key `${tournament.startDate ?? ''}|${tournament.endDate ?? ''}`}
					<DatePicker
						placeholder="End Date"
						value={tournament.endDate ? new Date(tournament.endDate) : null}
						isLoading={isLoadingDate}
						disabled={!tournament.startDate}
						minValue={tournament.startDate ? new Date(tournament.startDate) : undefined}
						onChange={handleEndDateChange}
					/>
				{/key}
			</Card.Description>
		{:else}
			<Card.Description class="flex items-center gap-2">
				{tournament.startDate ? formateDate(tournament.startDate) : 'No Start Date'}
				—
				{tournament.endDate ? formateDate(tournament.endDate) : 'No End Date'}
			</Card.Description>
		{/if}
	</Card.Header>
	<Card.Footer class="justify-end gap-2">
		{#if !tournament.isFinalized}
			<AlertDialog.Root
				open={isFinalizeAlertOpen}
				onOpenChange={(open) => (isFinalizeAlertOpen = open)}
			>
				<AlertDialog.Trigger>
					{#snippet child({ props })}
						<Button {...props} variant="secondary" disabled={isLoadingFinalize} class="w-24">
							{#if isLoadingFinalize}
								<Loader class="animate-spin" />
							{:else}
								Finalize
							{/if}
						</Button>
					{/snippet}
				</AlertDialog.Trigger>
				<AlertDialog.Content>
					<AlertDialog.Header>
						<AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
						<AlertDialog.Description>
							This action cannot be undone. This will permanently finalize the tournament. Players
							will no longer be able to join or leave the tournament.
						</AlertDialog.Description>
					</AlertDialog.Header>
					<AlertDialog.Footer>
						<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
						<AlertDialog.Action onclick={handleFinalize}>Continue</AlertDialog.Action>
					</AlertDialog.Footer>
				</AlertDialog.Content>
			</AlertDialog.Root>
		{/if}
		{#if tournament.isActive}
			<AlertDialog.Root
				open={isCompleteAlertOpen}
				onOpenChange={(open) => (isCompleteAlertOpen = open)}
			>
				<AlertDialog.Trigger>
					{#snippet child({ props })}
						<Button
							{...props}
							onclick={handleCompleteAlert}
							disabled={isLoadingComplete}
							class="w-24"
						>
							{#if isLoadingComplete}
								<Loader class="animate-spin" />
							{:else}
								Complete
							{/if}
						</Button>
					{/snippet}
				</AlertDialog.Trigger>
				<AlertDialog.Content>
					<AlertDialog.Header>
						<AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
						<AlertDialog.Description>
							This action cannot be undone. This will permanently mark the tournament as complete.
						</AlertDialog.Description>
					</AlertDialog.Header>
					<AlertDialog.Footer>
						<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
						<AlertDialog.Action onclick={handleComplete}>Continue</AlertDialog.Action>
					</AlertDialog.Footer>
				</AlertDialog.Content>
			</AlertDialog.Root>
		{/if}
	</Card.Footer>
</Card.Root>
