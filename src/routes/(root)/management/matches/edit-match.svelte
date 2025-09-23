<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';

	import DatePicker from '$lib/components/date-picker.svelte';
	import Label from '$lib/components/ui/label/label.svelte';

	import SquarePen from '@lucide/svelte/icons/square-pen';
	import LoaderIcon from '@lucide/svelte/icons/loader';

	import { getMatchWinner, handleUserErrors, withErrorHandling } from '$lib';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { toast } from 'svelte-sonner';

	import type { MatchInsertModel, MatchSelectModel, MatchWithDetails } from '$lib/server/db/types';
	import type { ApiResponse } from '$lib/types';

	let { match }: { match: MatchWithDetails } = $props();
	let preservedMatch = $state({ ...match });

	let isUpdatingMatch = $state<boolean>(false);
	let isDialogOpen = $state<boolean>(false);

	const handleSave = async () => {
		const insertMatch: MatchInsertModel = {
			tournamentId: match.tournamentId,
			team1Id: match.team1Id,
			team2Id: match.team2Id,
			team1Points: match.team1Points || 0,
			team2Points: match.team2Points || 0,
			winnerId: getMatchWinner(match, true),
			playDate: match.playDate
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
				isDialogOpen = false;
			} else {
				handleUserErrors(data.error);
				match = preservedMatch;
			}
		}, 'Error updating match');
		isUpdatingMatch = false;
	};
</script>

<Dialog.Root open={isDialogOpen} onOpenChange={(isOpen) => (isDialogOpen = isOpen)}>
	<Dialog.Trigger>
		<Button variant="default" size="icon">
			<SquarePen />
		</Button>
	</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Edit Match</Dialog.Title>
			<Dialog.Description>
				Modify the details of the match between {match.team1.name} and {match.team2.name}.
			</Dialog.Description>
		</Dialog.Header>
		<form class="space-y-4">
			<div class="space-y-2">
				<Label for="team1">{match.team1.name} Points</Label>
				<Input id="team1" bind:value={match.team1Points} type="number" />
			</div>
			<div class="space-y-2">
				<Label for="team2">{match.team2.name} Points</Label>
				<Input id="team2" bind:value={match.team2Points} type="number" />
			</div>
			<div class="space-y-2">
				<Label for="playDate">Play Date</Label>
				<DatePicker
					id="playDate"
					placeholder="Play Date"
					value={match.playDate ? new Date(match.playDate) : null}
					onChange={(date) => (match.playDate = date || '')}
				/>
			</div>
			<Button class="w-full" onclick={handleSave}>
				{#if isUpdatingMatch}
					<LoaderIcon class="animate-spin" />
				{:else}
					Save Changes
				{/if}
			</Button>
		</form>
	</Dialog.Content>
</Dialog.Root>
