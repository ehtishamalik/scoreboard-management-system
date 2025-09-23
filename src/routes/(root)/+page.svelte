<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import TournamentCard from './tournament-card.svelte';

	import { page } from '$app/state';
	import { formateDate } from '$lib/utils';

	import type { PageData } from './$types';

	const { session, tournaments } = page.data as PageData;

	const activeTournaments = $derived(tournaments.filter((t) => t.isActive));
	const completedTournaments = $derived(tournaments.filter((t) => !t.isActive));
</script>

<section>
	<h1 class="mb-2 text-2xl font-bold">
		{session ? `Welcome ${session.user.name}` : 'Hello! Guest'}
	</h1>
	<p class="mb-6 text-muted-foreground">List of active tournaments</p>
	{#if activeTournaments.length === 0}
		<div
			class="mb-12 flex flex-col items-center justify-center rounded-lg border border-dashed p-8"
		>
			<p class="mb-2 text-center text-lg text-muted-foreground">
				<em>No active tournaments available at the moment.</em>
			</p>
			<p class="text-center text-sm text-muted-foreground">
				Please check back later for upcoming tournaments.
			</p>
		</div>
	{:else}
		<section
			class="mb-12 block grid-cols-[repeat(auto-fit,_minmax(500px,_1fr))] gap-6 space-y-6 lg:grid lg:space-y-0"
		>
			{#each activeTournaments as tournament (tournament.id)}
				<TournamentCard {tournament} {session} />
			{/each}
		</section>
	{/if}
	{#if completedTournaments.length > 0}
		<p class="mb-6 text-muted-foreground">List of completed tournaments</p>
		<section class="grid grid-cols-[repeat(auto-fit,_minmax(250px,_1fr))] gap-6">
			{#each completedTournaments as tournament (tournament.id)}
				<Card.Root>
					<Card.Header>
						<Card.Title>
							<h2 class="text-xl underline-offset-4 hover:underline">
								<a href={`/tournament/${tournament.slug}`}>{tournament.name}</a>
							</h2>
						</Card.Title>
						<Card.Description>
							<p>
								{tournament.startDate ? formateDate(tournament.startDate) : 'No Start Date'}
								—
								{tournament.endDate ? formateDate(tournament.endDate) : 'No End Date'}
							</p>
						</Card.Description>
					</Card.Header>
					<Card.Footer>
						<p>The tournament was marked complete at {formateDate(tournament.updatedAt)}.</p>
					</Card.Footer>
				</Card.Root>
			{/each}
		</section>
	{/if}
</section>
