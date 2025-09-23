<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import Card from './card.svelte';
	import Loader from '@lucide/svelte/icons/loader';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';

	import { handleUserErrors, withErrorHandling } from '$lib';
	import { containsSpecialChar } from '$lib/utils';
	import { toast } from 'svelte-sonner';
	import { page } from '$app/state';

	import type { TournamentSelectModel } from '$lib/server/db/types';
	import type { ApiResponse } from '$lib/types';
	import type { PageData } from './$types';

	const { tournaments } = page.data as PageData;

	let statedTournaments = $state<TournamentSelectModel[]>(tournaments);
	let newTournament = $state<string>('');
	let isDialogOpen = $state<boolean>(false);
	let isCreating = $state<boolean>(false);

	let isCreateDisabled = $derived(newTournament.trim() === '' || newTournament.trim().length < 3);

	const activeTournament = $derived(statedTournaments.filter((t) => t.isActive));
	const completedTournament = $derived(statedTournaments.filter((t) => !t.isActive));

	const handleCreateTournament = async (event: Event) => {
		event.preventDefault();
		const name = newTournament.trim();

		if (containsSpecialChar(name)) {
			toast.error('Tournament name contains special characters. Please remove them and try again.');
			return;
		}

		isCreating = true;
		await withErrorHandling(async () => {
			const response = await fetch('/api/tournaments', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name })
			});

			const data: ApiResponse<TournamentSelectModel> = await response.json();
			if (data.success) {
				statedTournaments = [data.data, ...statedTournaments];
				toast.success('Tournament created successfully');
				newTournament = '';
				isDialogOpen = false;
			} else {
				handleUserErrors(data.error);
			}
		}, 'Error creating tournament');

		isCreating = false;
	};
</script>

<section>
	<header class="mb-2 flex items-center justify-between gap-4">
		<h1 class="text-2xl font-bold">Manage Tournaments</h1>
		<Dialog.Root open={isDialogOpen} onOpenChange={() => (isDialogOpen = !isDialogOpen)}>
			<Dialog.Trigger>
				{#snippet child({ props })}
					<Button {...props}><PlusIcon /> Create Tournament</Button>
				{/snippet}
			</Dialog.Trigger>
			<Dialog.Content>
				<Dialog.Header>
					<Dialog.Title>Create New Tournament</Dialog.Title>
					<Dialog.Description>Name must be at least 3 characters long.</Dialog.Description>
					<form class="my-2 space-y-4" onsubmit={handleCreateTournament}>
						<Input bind:value={newTournament} placeholder="Tournament Name" />
						<Button type="submit" class="w-full" disabled={isCreateDisabled}>
							{#if isCreating}
								<Loader class="animate-spin" />
							{:else}
								Create
							{/if}
						</Button>
					</form>
				</Dialog.Header>
			</Dialog.Content>
		</Dialog.Root>
	</header>
	<p class="mb-6 text-muted-foreground">
		List of all tournaments. <strong>Create</strong>, <strong>manage</strong>, and
		<strong>finalize</strong> tournaments as needed.
	</p>
	{#if statedTournaments.length === 0}
		<div class="flex flex-col items-center justify-center rounded-lg border border-dashed p-8">
			<p class="mb-2 text-center text-lg text-muted-foreground">
				<em>No tournament found.</em>
			</p>
			<p class="text-center text-sm text-muted-foreground">Go ahead and create one.</p>
		</div>
	{:else}
		<section class="mb-12 grid grid-cols-[repeat(auto-fit,_minmax(350px,_1fr))] gap-6">
			{#each activeTournament as tournament (tournament.id)}
				<Card {tournament} />
			{/each}
		</section>
		<section class="grid grid-cols-[repeat(auto-fit,_minmax(350px,_1fr))] gap-6">
			{#each completedTournament as tournament (tournament.id)}
				<Card {tournament} />
			{/each}
		</section>
	{/if}
</section>
