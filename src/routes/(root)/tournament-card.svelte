<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';

	import Button from '$lib/components/ui/button/button.svelte';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import MinusIcon from '@lucide/svelte/icons/minus';
	import Loader from '@lucide/svelte/icons/loader';
	import UserIcon from '@lucide/svelte/icons/user';
	import Skeleton from '$lib/components/user-badge-skeleton.svelte';

	import { handleUserErrors, withErrorHandling } from '$lib';
	import { formateDate } from '$lib/utils';
	import { blur } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { toast } from 'svelte-sonner';
	import { onMount } from 'svelte';

	import type {
		ParticipationInsertModel,
		ParticipationSelectModel,
		ParticipationsWithUsers,
		TournamentSelectModel
	} from '$lib/server/db/types';
	import type { ApiResponse, SessionType } from '$lib/types';

	let {
		tournament,
		session
	}: {
		tournament: TournamentSelectModel;
		session: SessionType;
	} = $props();

	let userParticipation = $state<ParticipationSelectModel | undefined>(undefined);
	let participations = $state<ParticipationsWithUsers[]>([]);

	let isLoadingParticipation = $state<boolean>(false);
	let isLoading = $state<boolean>(false);
	let isLoadingAllParticipations = $state<boolean>(true);

	const handleAddParticipation = async () => {
		if (!session) {
			toast.error('Not logged in', {
				description: 'You must be logged in to participate'
			});
			return;
		}

		isLoading = true;
		await withErrorHandling(async () => {
			const participation: ParticipationInsertModel = {
				tournamentId: tournament.id,
				userId: session.user.id
			};
			const response = await fetch(`/api/participations?verify=true`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },

				body: JSON.stringify(participation)
			});

			const data: ApiResponse<ParticipationSelectModel> = await response.json();
			if (data.success) {
				toast.success('Participation added', {
					description: `You have been added to the ${tournament.name}`
				});
				getAllParticipations();
			} else {
				handleUserErrors(data.error);
			}
		}, 'Error adding participation');
		isLoading = false;
	};

	const handleRemoveParticipation = async () => {
		if (!session) {
			toast.error('Not logged in', {
				description: 'You must be logged in to remove participation.'
			});
			return;
		}

		if (!userParticipation) {
			toast.error("You haven't joined this tournament yet.", {
				description: 'Refresh the page and try again.'
			});
			window.location.reload();
			return;
		}

		isLoading = true;
		await withErrorHandling(async () => {
			const response = await fetch(
				`/api/participations/${userParticipation?.id}?verify=true&tournamentId=${tournament.id}`,
				{
					method: 'DELETE',
					headers: { 'Content-Type': 'application/json' }
				}
			);

			const data: ApiResponse<ParticipationSelectModel> = await response.json();
			if (data.success) {
				toast.success('Participation removed', {
					description: `You have been removed from the ${tournament.name}`
				});
				participations = participations.filter((p) => p.id !== data.data.id);
				userParticipation = undefined;
			} else {
				handleUserErrors(data.error);
			}
		}, 'Error removing participation');
		isLoading = false;
	};

	const getAllParticipations = async () => {
		await withErrorHandling(async () => {
			const response = await fetch(`/api/participations?tournamentId=${tournament.id}`, {
				method: 'GET',
				headers: { 'Content-Type': 'application/json' }
			});

			const data: ApiResponse<ParticipationsWithUsers[]> = await response.json();
			if (data.success) {
				participations = data.data;
				if (session) {
					userParticipation = data.data.find((p) => p.user?.id === session.user.id);
				}
			} else {
				handleUserErrors(data.error);
			}
		}, `Error fetching participation for ${tournament.name}`);
	};

	onMount(async () => {
		await getAllParticipations();
		isLoadingAllParticipations = false;
	});

	onMount(() => {
		let lastFetchTime = 0;
		const THROTTLE_MS = 30_000; // 30 seconds

		const handleVisibilityChange = () => {
			if (document.visibilityState === 'visible') {
				const now = Date.now();
				if (now - lastFetchTime > THROTTLE_MS) {
					getAllParticipations();
					lastFetchTime = now;
				}
			}
		};

		document.addEventListener('visibilitychange', handleVisibilityChange);
		return () => {
			document.removeEventListener('visibilitychange', handleVisibilityChange);
		};
	});
</script>

<Card.Root class="relative isolate">
	<Card.Header>
		<Card.Title class="mb-2 flex items-center justify-between gap-4">
			<h2 class="text-xl">
				{tournament.name}
			</h2>
			<a
				class="absolute inset-0"
				href={`/tournament/${tournament.slug}`}
				aria-label={`View tournament ${tournament.name}`}
			></a>
			{#if tournament.isFinalized}
				<Badge variant="default">
					<p>Finalized</p>
				</Badge>
			{/if}
		</Card.Title>
		<Card.Description class="flex flex-col gap-2">
			<p>
				{tournament.startDate ? formateDate(tournament.startDate) : 'No Start Date'}
				—
				{tournament.endDate ? formateDate(tournament.endDate) : 'No End Date'}
			</p>
			<p>
				Total participations: {isLoadingAllParticipations ? 'counting...' : participations.length}
			</p>
		</Card.Description>
	</Card.Header>
	<Card.Content>
		<div class="flex flex-wrap items-center gap-2">
			{#if isLoadingAllParticipations}
				<Skeleton />
			{:else}
				{#each participations as { id, user } (id)}
					<div
						class="inline-flex items-center gap-1 rounded-2xl border px-2 py-1"
						transition:blur
						animate:flip={{ duration: 500 }}
					>
						{#if user?.image}
							<img src={user.image} alt="User Avatar" class="size-4 rounded-full" />
						{:else}
							<UserIcon size={16} />
						{/if}
						<p class="text-xs">{user.name}</p>
					</div>
				{/each}
			{/if}
		</div>
	</Card.Content>
	<Card.Footer class="mt-auto justify-end">
		{#if session && !tournament.isFinalized && !userParticipation}
			<Button
				onclick={handleAddParticipation}
				variant="secondary"
				disabled={isLoading || isLoadingParticipation}
				class="relative z-10 w-24"
			>
				{#if isLoading || isLoadingParticipation}
					<Loader class="animate-spin" />
				{:else}
					<PlusIcon /> Add Me
				{/if}
			</Button>
		{:else if session && !tournament.isFinalized && userParticipation}
			<Button
				onclick={handleRemoveParticipation}
				variant="secondary"
				disabled={isLoading || isLoadingParticipation}
				class="relative z-10 w-32"
			>
				{#if isLoading || isLoadingParticipation}
					<Loader class="animate-spin" />
				{:else}
					<MinusIcon /> Remove Me
				{/if}
			</Button>
		{:else if session && tournament.isFinalized}
			<span></span>
		{:else if !session && tournament.isFinalized}
			<span></span>
		{:else}
			<Badge variant="outline">
				<p class="italic">Please login to participate.</p>
			</Badge>
		{/if}
	</Card.Footer>
</Card.Root>
