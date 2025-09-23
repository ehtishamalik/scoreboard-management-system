<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import Card from './card.svelte';

	import { page } from '$app/state';

	import type { PageData } from './$types';

	const { tournaments } = page.data as PageData;

	const activeFinalizedTournaments = $derived(
		tournaments.filter((t) => t.isActive && t.isFinalized)
	);
</script>

<section>
	<h1 class="mb-2 text-2xl font-bold">Manage Teams</h1>
	<p class="mb-6 max-w-2xl text-muted-foreground">
		Create or update teams in bulk. Each team must include a name and all players to be processed.
		Teams with missing data will be skipped and not saved.
	</p>
	{#if activeFinalizedTournaments.length === 0}
		<div class="flex flex-col items-center justify-center rounded-lg border border-dashed p-8">
			<p class="mb-2 text-center text-lg text-muted-foreground">
				<em>No tournaments available at the moment.</em>
			</p>
			<p class="text-center text-sm text-muted-foreground">
				Please make sure the tournaments are created and finalized to manage teams.
			</p>
		</div>
	{:else}
		<Tabs.Root value={activeFinalizedTournaments[0]?.id} class="w-full">
			<Tabs.List class="w-full">
				{#each activeFinalizedTournaments as tournament (tournament.id)}
					<Tabs.Trigger value={tournament.id}>{tournament.name}</Tabs.Trigger>
				{/each}
			</Tabs.List>
			{#each activeFinalizedTournaments as tournament (tournament.id)}
				<Tabs.Content value={tournament.id}>
					<Card {tournament} />
				</Tabs.Content>
			{/each}
		</Tabs.Root>
	{/if}
</section>
