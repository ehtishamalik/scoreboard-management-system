<script lang="ts">
  import * as Card from '$lib/components/ui/card/index.js';
  import * as Table from '$lib/components/ui/table/index.js';
  import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
  import * as ButtonGroup from '$lib/components/ui/button-group/index.js';

  import Label from '$lib/components/ui/label/label.svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import GenerateMatches from './generate-matches.svelte';
  import DatePicker from '$lib/components/date-picker.svelte';

  import CloseIcon from '@lucide/svelte/icons/circle-x';
  import SaveIcon from '@lucide/svelte/icons/save';
  import RefreshIcon from '@lucide/svelte/icons/refresh-cw';
  import GripHorizontal from '@lucide/svelte/icons/grip-horizontal';

  import { Spinner } from '$lib/components/ui/spinner/index.js';
  import { Switch } from '$lib/components/ui/switch';
  import { Input } from '$lib/components/ui/input/index.js';
  import { getMatchWinner, handleUserErrors, withErrorHandling } from '$lib';
  import { hasPassedDate, isToday } from '$lib/utils';
  import { IsMobile } from '$lib/hooks/is-mobile.svelte';
  import { toast } from 'svelte-sonner';
  import { onMount } from 'svelte';

  import type {
    MatchInsertModel,
    MatchWithDetails,
    TournamentSelectModel
  } from '$lib/server/db/types';
  import type { ApiResponse } from '$lib/types';

  let {
    tournament,
    allowNotifications
  }: {
    tournament: TournamentSelectModel;
    allowNotifications: boolean;
  } = $props();

  let matches = $state<MatchWithDetails[]>([]);
  let originalMatches = $state<MatchWithDetails[]>([]);

  let matchesWithDateMap = $state<string[]>([]);
  let matchesSearch = $state<string>('');
  let isSwitchChecked = $state<boolean>(true);
  let isAlertOpen = $state<boolean>(false);
  let selectedIndex = $state<number | null>(null);

  let isLoading = $state<boolean>(true);
  let isUpdatingMatch = $state<boolean>(false);
  let isNotifying = $state<string | null>(null);

  const isMobile = new IsMobile();

  const filteredMatches = $derived(
    matchesSearch.trim().length === 0
      ? matches
      : matches.filter((m) => {
          const terms = matchesSearch.toLowerCase().split(/\s+/).filter(Boolean);
          const combined = `${m.team1.name} ${m.team2.name}`.toLowerCase();
          return terms.every((t) => combined.includes(t));
        })
  );

  const isDragActive = $derived(!matchesSearch.trim() && !isMobile.current);

  function onSelectRow(index: number) {
    if (selectedIndex === null) {
      // first click → select this row
      selectedIndex = index;
    } else {
      // second click → perform action
      if (isSwitchChecked) {
        swapRows(selectedIndex, index);
      } else {
        moveRow(selectedIndex, index);
      }
      selectedIndex = null; // reset selection
    }
  }

  const handleReorder = (newMatches: MatchWithDetails[]) => {
    matches = newMatches.map((match, index) => {
      return { ...match, playDate: matchesWithDateMap[index] };
    });
  };

  function swapRows(i: number, j: number) {
    if (i === j) return;

    const updated = [...matches];
    [updated[i], updated[j]] = [updated[j], updated[i]];
    handleReorder(updated);
  }

  function moveRow(from: number, to: number) {
    if (from === to) return;

    const updated = [...matches];
    const [removed] = updated.splice(from, 1);
    updated.splice(to, 0, removed);
    handleReorder(updated);
  }

  const isMatchChanged = (original: MatchWithDetails, current: MatchWithDetails): boolean => {
    return (
      original.team1Points !== current.team1Points ||
      original.team2Points !== current.team2Points ||
      original.playDate !== current.playDate
    );
  };

  const getAllMatches = async () => {
    isLoading = true;
    await withErrorHandling(async () => {
      const response = await fetch(`/api/matches?tournamentId=${tournament.id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      const data: ApiResponse<MatchWithDetails[]> = await response.json();
      if (data.success) {
        matches = data.data;
        originalMatches = data.data;
        matchesWithDateMap = [];
        matches.forEach((match, index) => {
          if (match.playDate) {
            const dateKey = new Date(match.playDate).toISOString().split('T')[0];
            matchesWithDateMap.push(dateKey);
          }
        });
      } else {
        handleUserErrors(data.error);
      }
    }, `Error fetching matches for ${tournament.name}`);
    isLoading = false;
  };

  const handleSave = async () => {
    // 🔍 Filter only changed matches
    const changedMatches = matches.filter((match, index) => {
      const original = originalMatches.find((m) => m.id === match.id);
      if (!original) return true; // new match or missing original → treat as changed
      if (hasPassedDate(original.playDate)) return false;
      return isMatchChanged(original, match);
    });

    if (changedMatches.length === 0) {
      toast.info('No changes to save.');
      isAlertOpen = false;
      return;
    }

    const insertMatch: MatchInsertModel[] = changedMatches.map((match) => ({
      id: match.id,
      tournamentId: match.tournamentId,
      team1Id: match.team1Id,
      team2Id: match.team2Id,
      team1Points: match.team1Points || 0,
      team2Points: match.team2Points || 0,
      winnerId: getMatchWinner(match, true),
      playDate: match.playDate
    }));

    isUpdatingMatch = true;
    isAlertOpen = false;
    await withErrorHandling(async () => {
      const response = await fetch(`/api/matches/bulk`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(insertMatch)
      });

      const data: ApiResponse<null> = await response.json();
      if (data.success) {
        toast.success(
          `${insertMatch.length} match${insertMatch.length > 1 ? 'es' : ''} updated successfully`
        );
        getAllMatches();
        if (tournament.isStarted) {
          changedMatches.forEach((match) => {
            handleSendNotification({ match });
          });
        }
      } else {
        handleUserErrors(data.error);
      }
    }, 'Error updating match');
    isUpdatingMatch = false;
  };

  const handleSendNotification = async ({ match }: { match: MatchWithDetails }) => {
    if (!allowNotifications) return;

    return await fetch('/api/push/notify/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userIds: [
          match.team1.participationPlayerOne.userId,
          match.team1.participationPlayerTwo.userId,
          match.team2.participationPlayerOne.userId,
          match.team2.participationPlayerTwo.userId
        ],
        title: `Match Updated in ${match.tournament.name}`,
        message: getNotificationMessage(match)
      })
    });
  };

  const getNotificationMessage = (match: MatchWithDetails) => {
    if (isToday(match.playDate) && match.team1Points === 0 && match.team2Points === 0) {
      return `${match.team1.name} vs ${match.team2.name} — happening today`;
    }

    return `${match.team1.name} vs ${match.team2.name} has been updated. Check it now!`;
  };

  onMount(() => {
    getAllMatches();
  });
</script>

<Card.Root class="transition-all">
  <Card.Header>
    <Card.Title class="flex items-start justify-between gap-4">
      <h2 class="text-xl">{tournament.name}</h2>
      <div class="ml-auto flex items-center gap-2">
        {#if !tournament.isStarted && !isLoading && !isMobile.current}
          <GenerateMatches {tournament} matchesLength={matches.length} callback={getAllMatches} />
        {/if}

        <Button variant="outline" size="icon" disabled={isLoading} onclick={getAllMatches}>
          <RefreshIcon class={{ 'animate-spin': isLoading }} />
        </Button>

        <AlertDialog.Root open={isAlertOpen} onOpenChange={(open) => (isAlertOpen = open)}>
          <AlertDialog.Trigger>
            {#snippet child({ props })}
              <Button {...props} variant="outline" size="icon" disabled={isUpdatingMatch}>
                {#if isUpdatingMatch}
                  <Spinner />
                {:else}
                  <SaveIcon />
                {/if}
              </Button>
            {/snippet}
          </AlertDialog.Trigger>
          <AlertDialog.Content>
            <AlertDialog.Header>
              <AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
              <AlertDialog.Description>
                This action will save all the changes made to the matches. Please make sure you have
                reviewed all changes before proceeding.
              </AlertDialog.Description>
            </AlertDialog.Header>
            <AlertDialog.Footer>
              <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
              <AlertDialog.Action onclick={handleSave}>Continue</AlertDialog.Action>
            </AlertDialog.Footer>
          </AlertDialog.Content>
        </AlertDialog.Root>
      </div>
    </Card.Title>
    <Card.Description class="my-2 flex flex-col space-y-2 sm:space-y-1">
      <p>Total Matches: {isLoading ? 'counting...' : filteredMatches.length}</p>
      {#if !tournament.isStarted}
        <p>Start the tournament to manage scores.</p>
      {/if}
      {#if !isMobile.current}
        <div class="flex items-center justify-end gap-2">
          <Label for="dragType" class="mr-2">
            {#if selectedIndex !== null}
              Click on another row to {isSwitchChecked ? 'swap' : 'insert'}
            {:else}
              {isSwitchChecked ? 'Swap' : 'Insert'} mode (Click on drag icon to select a row)
            {/if}
          </Label>
          <Switch id="dragType" bind:checked={isSwitchChecked} />
        </div>
      {/if}
      <ButtonGroup.Root class="w-full max-w-sm">
        <Input bind:value={matchesSearch} placeholder="Filter matches using team name." />
        <Button variant="outline" size="icon" onclick={() => (matchesSearch = '')}>
          <CloseIcon />
        </Button>
      </ButtonGroup.Root>
    </Card.Description>
  </Card.Header>
  <Card.Footer>
    <Table.Root>
      {#if isLoading}
        <Table.Caption>Loading....</Table.Caption>
      {:else if filteredMatches.length === 0}
        <Table.Caption>No matches found.</Table.Caption>
      {/if}
      <Table.Header>
        <Table.Row>
          {#if isDragActive}
            <Table.Head class="w-9">
              <GripHorizontal class="size-5" />
            </Table.Head>
          {/if}
          <Table.Head class="w-9">#</Table.Head>
          <Table.Head>Team One</Table.Head>
          <Table.Head class="w-24">Points</Table.Head>
          <Table.Head>Team Two</Table.Head>
          <Table.Head class="w-24">Points</Table.Head>
          <Table.Head>Winner</Table.Head>
          <Table.Head>Play Date</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {#each filteredMatches as match, index (match.id)}
          <Table.Row
            class={{ 'relative transition-colors': true, 'bg-muted': selectedIndex === index }}
          >
            {#if isDragActive}
              <Table.Cell class="font-medium">
                <button
                  class="not-disabled:cursor-pointer disabled:opacity-40"
                  disabled={hasPassedDate(match.playDate)}
                  onclick={() => {
                    if (hasPassedDate(match.playDate)) return;
                    onSelectRow(index);
                  }}
                >
                  <GripHorizontal class="size-5" />
                </button>
              </Table.Cell>
            {/if}

            <Table.Cell class="font-medium">{index + 1}</Table.Cell>
            <Table.Cell
              class={{ 'text-emerald-600': getMatchWinner(match, true) === match.team1.id }}
              >{match.team1.name}</Table.Cell
            >
            <Table.Cell>
              <Input
                bind:value={match.team1Points}
                type="number"
                disabled={hasPassedDate(match.playDate) || !tournament.isStarted}
              />
            </Table.Cell>
            <Table.Cell
              class={{ 'text-emerald-600': getMatchWinner(match, true) === match.team2.id }}
              >{match.team2.name}</Table.Cell
            >
            <Table.Cell>
              <Input
                bind:value={match.team2Points}
                type="number"
                disabled={hasPassedDate(match.playDate) || !tournament.isStarted}
              />
            </Table.Cell>
            <Table.Cell class={{ 'text-pink-800': !getMatchWinner(match, true) }}
              >{getMatchWinner(match, false)}</Table.Cell
            >
            <Table.Cell>
              <DatePicker
                placeholder="Play Date"
                value={match.playDate ? new Date(match.playDate) : null}
                onChange={(date) => (match.playDate = date || '')}
                disabled={hasPassedDate(match.playDate) || !tournament.isStarted}
              />
            </Table.Cell>
          </Table.Row>
        {/each}
      </Table.Body>
    </Table.Root>
  </Card.Footer>
</Card.Root>
