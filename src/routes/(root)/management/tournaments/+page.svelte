<script lang="ts">
  import * as Dialog from '$lib/components/ui/dialog/index.js';
  import Card from './card.svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import Input from '$lib/components/ui/input/input.svelte';
  import Spinner from '$lib/components/ui/spinner/spinner.svelte';
  import Label from '$lib/components/ui/label/label.svelte';
  import HeadingCreator from '$lib/components/heading-creator.svelte';
  import CompleteTournamentCard from '$lib/components/complete-tournament-card.svelte';
  import NotAvailableBanner from '$lib/components/not-available-banner.svelte';

  import { PlusIcon } from '@lucide/svelte/icons';
  import { Checkbox } from '$lib/components/ui/checkbox/index.js';
  import { handleUserErrors, withErrorHandling } from '$lib';
  import { containsSpecialChar } from '$lib/utils';
  import { toast } from 'svelte-sonner';
  import { page } from '$app/state';

  import type { TournamentSelectModel } from '$lib/server/db/types';
  import type { ApiResponse } from '$lib/types';
  import type { PageData } from './$types';

  const { tournaments } = page.data as PageData;

  let newTournament = $state<string>('');
  let isSinglePlayer = $state<boolean>(false);
  let isDialogOpen = $state<boolean>(false);
  let isCreating = $state<boolean>(false);

  let isCreateDisabled = $derived(newTournament.trim() === '' || newTournament.trim().length < 3);

  const activeTournament = $derived(tournaments.filter((t) => t.isActive));
  const completedTournament = $derived(tournaments.filter((t) => !t.isActive));

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
        body: JSON.stringify({ name, isSinglePlayer })
      });

      const data: ApiResponse<TournamentSelectModel> = await response.json();
      if (data.success) {
        toast.success('Tournament created successfully', {
          description: `Tournament "${data.data.name}" has been created.`
        });
        isDialogOpen = false;
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        handleUserErrors(data.error);
      }
    }, 'Error creating tournament');

    isCreating = false;
  };
</script>

<section>
  <HeadingCreator
    title="Manage Tournaments"
    description="List of all tournaments. Create, manage, and finalize tournaments as needed."
    type="h1"
  >
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
            <div class="flex items-center gap-0">
              <Checkbox id="single-player-checkbox" bind:checked={isSinglePlayer} />
              <Label class="ml-2 select-none" for="single-player-checkbox"
                >Single Player Tournament</Label
              >
            </div>
            <Button type="submit" class="w-full" disabled={isCreateDisabled}>
              {#if isCreating}
                <Spinner />
              {:else}
                Create
              {/if}
            </Button>
          </form>
        </Dialog.Header>
      </Dialog.Content>
    </Dialog.Root>
  </HeadingCreator>

  {#if tournaments.length === 0}
    <NotAvailableBanner
      title="No active tournaments available at the moment."
      description="Go ahead and create one."
    />
  {:else}
    <section class="mb-12 grid grid-cols-[repeat(auto-fit,minmax(350px,1fr))] gap-6">
      {#each activeTournament as tournament (tournament.id)}
        <Card {tournament} />
      {/each}
    </section>
    <section class="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
      {#each completedTournament as tournament (tournament.id)}
        <CompleteTournamentCard {tournament} />
      {/each}
    </section>
  {/if}
</section>
