<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import Loader from '@lucide/svelte/icons/loader';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import Label from '$lib/components/ui/label/label.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import DatePicker from '$lib/components/date-picker.svelte';

	import { Input } from '$lib/components/ui/input/index.js';
	import { toast } from 'svelte-sonner';
	import { handleUserErrors, withErrorHandling } from '$lib';

	import type { ApiResponse } from '$lib/types';
	import type { MatchSelectModel, TournamentSelectModel } from '$lib/server/db/types';

	let {
		tournament,
		matchesLength,
		callback
	}: {
		tournament: TournamentSelectModel;
		matchesLength: number;
		callback: () => void;
	} = $props();

	let matchesStartDate = $state<string>('');
	const matchesPerDay = $state<{ day: string; value: number }[]>([
		{ day: 'Sunday', value: 0 },
		{ day: 'Monday', value: 3 },
		{ day: 'Tuesday', value: 3 },
		{ day: 'Wednesday', value: 3 },
		{ day: 'Thursday', value: 3 },
		{ day: 'Friday', value: 4 },
		{ day: 'Saturday', value: 0 }
	]);

	let isDialogOpen = $state<boolean>(false);
	let isGeneratingMatches = $state<boolean>(false);

	const handleGenerateMatches = async () => {
		if (
			!matchesStartDate ||
			new Date(matchesStartDate).toString() === 'Invalid Date' ||
			new Date(matchesStartDate) < new Date()
		) {
			toast.error('Please select a valid start date from tomorrow onwards.');
			return;
		}

		isDialogOpen = false;
		isGeneratingMatches = true;
		await withErrorHandling(async () => {
			const response = await fetch('/api/matches/bulk', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					tournamentId: tournament.id,
					startDate: matchesStartDate,
					matchesPerDay: {
						0: isNaN(Number(matchesPerDay[0].value)) ? 3 : matchesPerDay[0].value,
						1: isNaN(Number(matchesPerDay[1].value)) ? 3 : matchesPerDay[1].value,
						2: isNaN(Number(matchesPerDay[2].value)) ? 3 : matchesPerDay[2].value,
						3: isNaN(Number(matchesPerDay[3].value)) ? 3 : matchesPerDay[3].value,
						4: isNaN(Number(matchesPerDay[4].value)) ? 3 : matchesPerDay[4].value,
						5: isNaN(Number(matchesPerDay[5].value)) ? 3 : matchesPerDay[5].value,
						6: isNaN(Number(matchesPerDay[6].value)) ? 3 : matchesPerDay[6].value
					}
				})
			});

			const data: ApiResponse<MatchSelectModel[]> = await response.json();
			if (data.success) {
				toast.success(
					`Matches generated successfully for ${tournament.name}. Now loading new matches.`
				);
				matchesStartDate = '';
				callback();
			} else {
				handleUserErrors(data.error);
			}
		}, `Error generating matches for ${tournament.name}`);
		isGeneratingMatches = false;
	};
</script>

<Dialog.Root open={isDialogOpen} onOpenChange={() => (isDialogOpen = !isDialogOpen)}>
	<Dialog.Trigger>
		{#snippet child({ props })}
			<Button {...props} size="sm">
				{#if isGeneratingMatches}
					<Loader class="animate-spin" />
				{:else}
					<PlusIcon />
				{/if}
				{matchesLength === 0 ? 'Generate Matches' : 'Regenerate Matches'}
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
			<div class="space-y-4">
				<div class="space-y-2">
					<Label for="matchesStartDate">Start Date</Label>
					<DatePicker
						id="matchesStartDate"
						placeholder="Start generating from"
						value={matchesStartDate ? new Date(matchesStartDate) : null}
						minValue={new Date(new Date().setDate(new Date().getDate() + 1))}
						onChange={(date) => {
							matchesStartDate = date ? date : '';
						}}
					/>
				</div>
				<div class="space-y-2">
					<Label class="mx-auto">Custom Day Overrides</Label>
					<div class="grid grid-cols-4 items-center gap-2">
						{#each matchesPerDay as day, index (index)}
							<div class="space-y-2">
								<Label class="w-24" for={`day-${index}`}>{day.day}</Label>
								<Input id={`day-${index}`} type="number" min="0" bind:value={day.value} />
							</div>
						{/each}
					</div>
				</div>
				<Button class="w-full" disabled={isGeneratingMatches} onclick={handleGenerateMatches}>
					<PlusIcon />
					Generate Matches
				</Button>
			</div>
		</Dialog.Header>
	</Dialog.Content>
</Dialog.Root>
