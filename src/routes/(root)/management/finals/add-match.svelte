<script lang="ts">
  import * as Dialog from '$lib/components/ui/dialog/index.js';
  import * as Select from '$lib/components/ui/select/index.js';
  import DatePicker from '$lib/components/date-picker.svelte';

  import Label from '$lib/components/ui/label/label.svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import PlusIcon from '@lucide/svelte/icons/plus';

  import { Spinner } from '$lib/components/ui/spinner/index.js';
  import { handleUserErrors, withErrorHandling } from '$lib';
  import { toast } from 'svelte-sonner';

  import type {
    MatchInsertModel,
    MatchSelectModel,
    MatchSeriesInsertModel,
    TeamWithPlayers,
    TournamentSelectModel
  } from '$lib/server/db/types';
  import type { ApiResponse, MatchType } from '$lib/types';

  let {
    teams,
    tournament,
    isLoadingTeams,
    callback
  }: {
    teams: TeamWithPlayers[];
    tournament: TournamentSelectModel;
    isLoadingTeams: boolean;
    callback: () => void;
  } = $props();

  let matchFields = $state<Omit<MatchSeriesInsertModel, 'tournamentId'>>({
    team1Id: '',
    team2Id: '',
    type: 'SEMIFINAL',
    playedDate: ''
  });

  let match = $derived<MatchSeriesInsertModel>({
    ...matchFields,
    tournamentId: tournament.id
  });

  let isCreatingMatch = $state<boolean>(false);
  let isDialogOpen = $state<boolean>(false);

  const selectedTeamOne = $derived(
    teams.find((t) => t.id === match.team1Id)?.name || 'Select First Team'
  );

  const selectedTeamTwo = $derived(
    teams.find((t) => t.id === match.team2Id)?.name || 'Select Second Team'
  );

  const isAddMatchButtonDisabled = $derived(
    isCreatingMatch ||
      isLoadingTeams ||
      !match.team1Id ||
      !match.playedDate ||
      !match.team2Id ||
      match.team1Id === match.team2Id
  );

  const handleCreateMatch = async (event: Event) => {
    event.preventDefault();
    isDialogOpen = false;

    isCreatingMatch = true;
    await withErrorHandling(async () => {
      const response = await fetch(`/api/match-series`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(match)
      });

      const data: ApiResponse<MatchSelectModel> = await response.json();
      if (data.success) {
        toast.success('Match series created successfully');
        resetMatchForm();
        callback();
      } else {
        handleUserErrors(data.error);
      }
    }, 'Error creating match series');
    isCreatingMatch = false;
  };

  const resetMatchForm = () => {
    matchFields = {
      team1Id: '',
      team2Id: '',
      type: 'SEMIFINAL',
      playedDate: ''
    };
  };

  const availableTeams = (excludeId: string) => {
    if (!excludeId) return teams;
    return teams.filter((t) => t.id !== excludeId);
  };

  const handleDialogClose = (open: boolean) => {
    isDialogOpen = open;

    if (!open) {
      setTimeout(() => {
        resetMatchForm();
      }, 500);
    }
  };
</script>

<Dialog.Root open={isDialogOpen} onOpenChange={handleDialogClose}>
  <Dialog.Trigger>
    {#snippet child({ props })}
      <Button {...props} size="sm">
        {#if isCreatingMatch}
          <Spinner />
        {:else}
          <PlusIcon />
        {/if}
      </Button>
    {/snippet}
  </Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Add Match</Dialog.Title>
      <Dialog.Description>
        Create a new match for the tournament {tournament.name}.
      </Dialog.Description>
      <form class="my-2 space-y-4" onsubmit={handleCreateMatch}>
        <div class="space-y-2">
          <Label for="team-one">Team One</Label>
          <Select.Root type="single" name="team1" bind:value={matchFields.team1Id}>
            <Select.Trigger id="team-one" class="w-full">{selectedTeamOne}</Select.Trigger>
            <Select.Content>
              {#each availableTeams(match.team2Id) as { id, name } (id)}
                <Select.Item value={id}>{name}</Select.Item>
              {/each}
            </Select.Content>
          </Select.Root>
        </div>
        <div class="space-y-2">
          <Label for="team-two">Team Two</Label>
          <Select.Root type="single" name="team2" bind:value={matchFields.team2Id}>
            <Select.Trigger id="team-two" class="w-full">{selectedTeamTwo}</Select.Trigger>
            <Select.Content>
              {#each availableTeams(match.team1Id) as { id, name } (id)}
                <Select.Item value={id}>{name}</Select.Item>
              {/each}
            </Select.Content>
          </Select.Root>
        </div>
        <div class="space-y-2">
          <Label for="match-type">Type</Label>
          <Select.Root type="single" name="type" bind:value={matchFields.type}>
            <Select.Trigger id="match-type" class="w-full"
              >{match.type === 'SEMIFINAL' ? 'SEMI-FINAL' : 'FINAL'}</Select.Trigger
            >
            <Select.Content>
              <Select.Item value="SEMIFINAL">SEMI-FINAL</Select.Item>
              <Select.Item value="FINAL">FINAL</Select.Item>
            </Select.Content>
          </Select.Root>
        </div>
        <div class="space-y-2">
          <Label for="match-date">Play Date</Label>
          <DatePicker
            id="match-date"
            placeholder="Play Date"
            value={match.playedDate ? new Date(match.playedDate) : null}
            minValue={new Date()}
            onChange={(date) => {
              matchFields.playedDate = date ? date : '';
            }}
          />
        </div>
        <Button class="w-full" type="submit" disabled={isAddMatchButtonDisabled}>
          {#if isLoadingTeams}
            <Spinner />
            Loading Teams...
          {:else}
            <PlusIcon />
            Add Match
          {/if}
        </Button>
      </form>
    </Dialog.Header>
  </Dialog.Content>
</Dialog.Root>
