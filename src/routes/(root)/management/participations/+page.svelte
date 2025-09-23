<script lang="ts">
	import Card from './card.svelte';

	import { page } from '$app/state';

	import type { PageData } from './$types';

	const { tournaments } = page.data as PageData;

	const activeFinalizedTournaments = $derived(
		tournaments.filter((t) => t.isActive && t.isFinalized)
	);
</script>

<section>
	<h1 class="mb-2 text-2xl font-bold">Manage Participations</h1>
	<p class="mb-6 max-w-2xl text-muted-foreground">
		Manage team participations in your tournaments. <br />
		Respective teams and matches will be removed upon deleting a participation.
	</p>
	{#if activeFinalizedTournaments.length === 0}
		<div class="flex flex-col items-center justify-center rounded-lg border border-dashed p-8">
			<p class="mb-2 text-center text-lg text-muted-foreground">
				<em>No tournaments available at the moment.</em>
			</p>
			<p class="text-center text-sm text-muted-foreground">
				Please make sure the tournaments are created and finalized to manage participations.
			</p>
		</div>
	{:else}
		<section class="grid grid-cols-[repeat(auto-fit,_minmax(350px,_1fr))] gap-6">
			{#each activeFinalizedTournaments as tournament (tournament.id)}
				<Card {tournament} />
			{/each}
		</section>
	{/if}
</section>
