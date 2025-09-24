<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Select from '$lib/components/ui/select/index.js';

	import Button from '$lib/components/ui/button/button.svelte';
	import TrashIcon from '@lucide/svelte/icons/trash-2';
	import RefreshIcon from '@lucide/svelte/icons/refresh-cw';
	import LoaderIcon from '@lucide/svelte/icons/loader';
	import PlusIcon from '@lucide/svelte/icons/plus';

	import { handleUserErrors, withErrorHandling } from '$lib';
	import { onMount } from 'svelte';
	import { formateDate } from '$lib/utils';
	import { toast } from 'svelte-sonner';

	import type {
		ParticipationInsertModel,
		ParticipationSelectModel,
		ParticipationsWithUsers,
		TournamentSelectModel,
		UserSelectModel
	} from '$lib/server/db/types';
	import type { ApiResponse } from '$lib/types';

	let props = $props();
	let tournament = $derived<TournamentSelectModel>(props.tournament);

	let participations = $state<ParticipationsWithUsers[]>([]);
	let nonParticipations = $state<UserSelectModel[]>([]);
	let userToAdd = $state<string[]>([]);
	let isDialogOpen = $state<boolean>(false);

	let isLoading = $state<boolean>(true);
	let isLoadingDeleteParticipation = $state<boolean>(false);
	let isLoadingAddParticipation = $state<boolean>(false);
	let isLoadingNonParticipation = $state<boolean>(false);

	const getNonParticipatedUsers = async () => {
		isLoadingNonParticipation = true;

		await withErrorHandling(async () => {
			const response = await fetch(`/api/users/not-participated?tournamentId=${tournament.id}`, {
				method: 'GET',
				headers: { 'Content-Type': 'application/json' }
			});

			const data: ApiResponse<UserSelectModel[]> = await response.json();
			if (data.success) {
				nonParticipations = data.data;
			} else {
				handleUserErrors(data.error);
			}
		}, `Error fetching non participated users for ${tournament.name}`);
		isLoadingNonParticipation = false;
	};

	const getAllParticipations = async () => {
		isLoading = true;

		await withErrorHandling(async () => {
			const response = await fetch(`/api/participations?tournamentId=${tournament.id}`, {
				method: 'GET',
				headers: { 'Content-Type': 'application/json' }
			});

			const data: ApiResponse<ParticipationsWithUsers[]> = await response.json();
			if (data.success) {
				participations = data.data;
			} else {
				handleUserErrors(data.error);
			}
		}, `Error fetching participations for ${tournament.name}`);
		isLoading = false;
	};

	const handleAddParticipations = async () => {
		if (userToAdd.length === 0) return;

		isLoadingAddParticipation = true;
		const participations: ParticipationInsertModel[] = userToAdd.map((userId) => ({
			tournamentId: tournament.id,
			userId
		}));

		await withErrorHandling(async () => {
			const response = await fetch(`/api/participations/bulk`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },

				body: JSON.stringify(participations)
			});

			const data: ApiResponse<ParticipationsWithUsers[]> = await response.json();
			if (data.success) {
				toast.success('Participations added', {
					description: `Users has been added to the ${tournament.name}`
				});
				userToAdd = [];
				isDialogOpen = false;
				getAllParticipations();
			} else {
				handleUserErrors(data.error);
			}
		}, `Error adding participation for ${tournament.name}`);
		isLoadingAddParticipation = false;
	};

	const handleDeleteParticipation = async (participationId: string) => {
		isLoadingDeleteParticipation = true;

		await withErrorHandling(async () => {
			const response = await fetch(`/api/participations/${participationId}`, {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' }
			});

			const data: ApiResponse<ParticipationSelectModel> = await response.json();
			if (data.success) {
				participations = participations.filter((p) => p.id !== participationId);
			} else {
				handleUserErrors(data.error);
			}
		}, `Error deleting participation for ${tournament.name}`);
		isLoadingDeleteParticipation = false;
	};

	const selectedUsers = $derived(
		userToAdd.length
			? nonParticipations
					.filter((user) => userToAdd.includes(user.id))
					.map((user) => user.name)
					.join(', ')
			: 'Select your players'
	);

	onMount(() => {
		getAllParticipations();
	});

	$effect(() => {
		if (isDialogOpen) {
			getNonParticipatedUsers();
		} else {
			userToAdd = [];
		}
	});
</script>

<Card.Root class="transition-all">
	<Card.Header>
		<Card.Title class="flex items-center justify-between gap-4">
			<h2 class="text-xl">{tournament.name}</h2>
			<div class="flex items-center gap-2">
				<Dialog.Root
					open={isDialogOpen}
					onOpenChange={() => {
						isDialogOpen = !isDialogOpen;
					}}
				>
					<Dialog.Trigger>
						{#snippet child({ props })}
							<Button
								{...props}
								variant="secondary"
								size="icon"
								disabled={isLoading || isLoadingAddParticipation}
							>
								<PlusIcon />
							</Button>
						{/snippet}
					</Dialog.Trigger>
					<Dialog.Content>
						<Dialog.Header>
							<Dialog.Title>Add Participations</Dialog.Title>
							<Dialog.Description>Select players to add to the tournament.</Dialog.Description>
						</Dialog.Header>
						<Select.Root
							type="multiple"
							bind:value={userToAdd}
							disabled={isLoadingNonParticipation}
						>
							<Select.Trigger class="w-full overflow-hidden text-ellipsis">
								{selectedUsers}
							</Select.Trigger>
							<Select.Content>
								{#if nonParticipations.length === 0}
									<Select.Item value="" disabled>No players available</Select.Item>
								{:else}
									{#each nonParticipations as user (user.id)}
										<Select.Item value={user.id}>
											{user.name}
										</Select.Item>
									{/each}
								{/if}
							</Select.Content>
						</Select.Root>
						<Button
							onclick={handleAddParticipations}
							disabled={isLoadingAddParticipation || userToAdd.length === 0}
						>
							{#if isLoadingAddParticipation}
								<LoaderIcon class="animate-spin" />
							{:else}
								{isLoadingNonParticipation ? 'Loading...' : 'Add Participations'}
							{/if}
						</Button>
					</Dialog.Content>
				</Dialog.Root>

				<Button variant="outline" size="icon" disabled={isLoading} onclick={getAllParticipations}>
					<RefreshIcon class={{ 'animate-spin': isLoading }} />
				</Button>
			</div>
		</Card.Title>
		<Card.Description class="flex flex-col gap-1">
			<p>Total Participations: {isLoading ? 'counting...' : participations.length}</p>
		</Card.Description>
	</Card.Header>
	<Card.Content>
		<Table.Root>
			{#if isLoading}
				<Table.Caption>Loading....</Table.Caption>
			{:else if participations.length === 0}
				<Table.Caption>No participation found.</Table.Caption>
			{/if}
			<Table.Header>
				<Table.Row>
					<Table.Head class="w-9">#</Table.Head>
					<Table.Head>Name</Table.Head>
					<Table.Head>Joined At</Table.Head>
					<Table.Head class="text-right">Remove</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each participations as { id, joinedAt, user }, i (id)}
					<Table.Row>
						<Table.Cell class="font-medium">{i + 1}</Table.Cell>
						<Table.Cell>{user.name}</Table.Cell>
						<Table.Cell>{formateDate(joinedAt)}</Table.Cell>
						<Table.Cell class="text-right">
							<Button
								variant="destructive"
								size="icon"
								onclick={() => handleDeleteParticipation(id)}
								disabled={isLoadingDeleteParticipation}
							>
								<TrashIcon />
							</Button>
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</Card.Content>
</Card.Root>
