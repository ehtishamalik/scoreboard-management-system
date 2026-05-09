<script lang="ts">
  import * as Accordion from '$lib/components/ui/accordion/index.js';
  import * as Table from '$lib/components/ui/table/index.js';
  import * as Card from '$lib/components/ui/card/index.js';
  import AddMatch from './add-match.svelte';

  import Spinner from '$lib/components/ui/spinner/spinner.svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import RefreshIcon from '@lucide/svelte/icons/refresh-cw';
  import Trash_2 from '@lucide/svelte/icons/trash-2';

  import { getMatchSeriesWinner, handleUserErrors, withErrorHandling } from '$lib';
  import { Input } from '$lib/components/ui/input/index.js';
  import { formateDate, hasPassedDate } from '$lib/utils';
  import { toast } from 'svelte-sonner';
  import { onMount } from 'svelte';

  import type {
    MatchSelectModel,
    MatchSeriesInsertModel,
    MatchSeriesWithDetails,
    MatchWithDetails,
    TeamWithPlayers,
    TournamentSelectModel
  } from '$lib/server/db/types';
  import type { ApiResponse } from '$lib/types';
  import Save from '@lucide/svelte/icons/save';
  import Plus from '@lucide/svelte/icons/plus';
  import DatePicker from '$lib/components/date-picker.svelte';

  let {
    tournament
  }: {
    tournament: TournamentSelectModel;
  } = $props();

  let teams = $state<TeamWithPlayers[]>([]);
  let matches = $state<MatchSeriesWithDetails[]>([]);

  let isLoadingTeams = $state<boolean>(false);
  let isLoadingMatches = $state<boolean>(true);

  let isUpdatingMatch = $state<string | null>(null);
  let isDeletingMatches = $state<string | null>(null);

  let game3Visible = $state<string[]>([]);

  const getAllTeams = async () => {
    isLoadingTeams = true;
    await withErrorHandling(async () => {
      const response = await fetch(`/api/teams?tournamentId=${tournament.id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      const data: ApiResponse<TeamWithPlayers[]> = await response.json();
      if (data.success) {
        teams = data.data;
      } else {
        handleUserErrors(data.error);
      }
    }, `Error getting teams for ${tournament.name}`);
    isLoadingTeams = false;
  };

  const getFinalMatches = async () => {
    isLoadingMatches = true;

    await withErrorHandling(async () => {
      const response = await fetch(`/api/match-series?tournamentId=${tournament.id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      const data: ApiResponse<MatchSeriesWithDetails[]> = await response.json();
      if (data.success) {
        matches = data.data.map((match) => ({
          ...match,
          winnerId: ''
        }));
      } else {
        handleUserErrors(data.error);
      }
    }, `Error fetching match series for ${tournament.name}`);
    isLoadingMatches = false;
  };

  const handleDeleteMatch = async (match: MatchSeriesWithDetails) => {
    isDeletingMatches = match.id;
    await withErrorHandling(async () => {
      const response = await fetch(`/api/match-series/${match.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      const data: ApiResponse<MatchSelectModel[]> = await response.json();
      if (data.success) {
        toast.success(`Match series deleted successfully for ${tournament.name}`);
        matches = matches.filter((m) => m.id !== match.id);
      } else {
        handleUserErrors(data.error);
      }
    }, `Error deleting match series for ${tournament.name}`);
    isDeletingMatches = null;
  };

  const handleUpdateMatch = async (match: MatchSeriesWithDetails) => {
    const insertMatch: MatchSeriesInsertModel = {
      id: match.id,
      createdAt: match.createdAt,
      playedDate: match.playedDate,
      type: match.type,
      tournamentId: tournament.id,
      team1Id: match.team1Id,
      team2Id: match.team2Id,
      winnerId: getMatchSeriesWinner(match, true),
      game1Team1Points: match.game1Team1Points,
      game1Team2Points: match.game1Team2Points,
      game2Team1Points: match.game2Team1Points,
      game2Team2Points: match.game2Team2Points,
      game3Team1Points: match.game3Team1Points,
      game3Team2Points: match.game3Team2Points
    };

    isUpdatingMatch = match.id;
    await withErrorHandling(async () => {
      const response = await fetch(`/api/match-series/${match.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(insertMatch)
      });

      const data: ApiResponse<MatchSelectModel> = await response.json();

      if (data.success) {
        toast.success('Match Series updated', {
          description: `Match series between ${match.team1.name} and ${match.team2.name} updated successfully.`
        });
      } else {
        handleUserErrors(data.error);
      }
    }, 'Error updating match series');
    isUpdatingMatch = null;
  };

  $inspect(game3Visible);

  onMount(() => {
    getFinalMatches();
    getAllTeams();
  });
</script>

<Card.Root class="transition-all">
  <Card.Header>
    <Card.Title class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <h2 class="text-xl">{tournament.name}</h2>
      <div class="ml-auto flex items-center gap-2">
        <AddMatch {tournament} {teams} {isLoadingTeams} callback={getFinalMatches} />
        <Button variant="outline" size="icon" disabled={isLoadingMatches} onclick={getFinalMatches}>
          <RefreshIcon class={{ 'animate-spin': isLoadingMatches }} />
        </Button>
      </div>
    </Card.Title>
    <Card.Description class="flex flex-col gap-4">
      <p>Total Match Series: {isLoadingMatches ? 'counting...' : matches.length}</p>
    </Card.Description>
  </Card.Header>
  <Card.Content>
    {#each matches as match (match.id)}
      <Accordion.Root type="multiple" class="mb-2">
        <Accordion.Item value={`item-${match.id}`}>
          <Accordion.Trigger class="mb-2 bg-muted px-4">
            <div>
              <p>
                {match.type} Match Series - {match.team1.name} vs {match.team2.name}
              </p>
              <div class="flex items-center gap-2 text-sm">
                <p>{formateDate(match.playedDate)}</p>
                {#if getMatchSeriesWinner(match)}
                  <p>
                    - Won By <strong class="text-emerald-400">{getMatchSeriesWinner(match)}</strong>
                  </p>
                {/if}
              </div>
            </div>
          </Accordion.Trigger>
          <Accordion.Content>
            <div>
              <div class="mt-2 mb-4 flex items-center justify-between gap-2">
                <div>
                  <DatePicker
                    placeholder="Play Date"
                    value={new Date(match.playedDate)}
                    minValue={new Date()}
                    onChange={(date) => {
                      match.playedDate = date ? date : '';
                    }}
                  />
                </div>
                <div>
                  {#if !hasPassedDate(match.playedDate)}
                    <Button
                      variant="default"
                      size="icon"
                      disabled={isUpdatingMatch === match.id}
                      onclick={() => handleUpdateMatch(match)}
                    >
                      {#if isUpdatingMatch === match.id}
                        <Spinner />
                      {:else}
                        <Save />
                      {/if}
                    </Button>

                    <Button
                      variant="destructive"
                      size="icon"
                      disabled={isDeletingMatches === match.id}
                      onclick={() => handleDeleteMatch(match)}
                    >
                      {#if isDeletingMatches === match.id}
                        <Spinner />
                      {:else}
                        <Trash_2 />
                      {/if}
                    </Button>
                  {/if}
                </div>
              </div>
              <Table.Root class="w-full">
                <Table.Header>
                  <Table.Row>
                    <Table.Head>Duel</Table.Head>
                    <Table.Head>{match.team1.name} Points</Table.Head>
                    <Table.Head>{match.team2.name} Points</Table.Head>
                    <Table.Head class="w-64">Winner</Table.Head>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  <Table.Row>
                    <Table.Cell>Duel of Dawn</Table.Cell>
                    <Table.Cell>
                      <Input type="number" min="0" bind:value={match.game1Team1Points} />
                    </Table.Cell>
                    <Table.Cell>
                      <Input type="number" min="0" bind:value={match.game1Team2Points} />
                    </Table.Cell>
                    <Table.Cell>
                      {match.game1Team1Points > match.game1Team2Points
                        ? match.team1.name
                        : match.game1Team2Points > match.game1Team1Points
                          ? match.team2.name
                          : 'No winner yet'}
                    </Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell>Duel of Valor</Table.Cell>
                    <Table.Cell>
                      <Input type="number" min="0" bind:value={match.game2Team1Points} />
                    </Table.Cell>
                    <Table.Cell>
                      <Input type="number" min="0" bind:value={match.game2Team2Points} />
                    </Table.Cell>
                    <Table.Cell>
                      {match.game2Team1Points > match.game2Team2Points
                        ? match.team1.name
                        : match.game2Team2Points > match.game2Team1Points
                          ? match.team2.name
                          : 'No winner yet'}
                    </Table.Cell>
                  </Table.Row>
                  {#if !game3Visible.includes(match.id) && match.game3Team1Points === 0 && match.game3Team2Points === 0}
                    <Table.Row>
                      <Table.Cell colspan={4}>
                        <Button
                          size="sm"
                          variant="ghost"
                          onclick={() => (game3Visible = [...game3Visible, match.id])}
                        >
                          <Plus /> Add Duel
                        </Button>
                      </Table.Cell>
                    </Table.Row>
                  {:else}
                    <Table.Row>
                      <Table.Cell>Duel of Glory</Table.Cell>
                      <Table.Cell>
                        <Input type="number" min="0" bind:value={match.game3Team1Points} />
                      </Table.Cell>
                      <Table.Cell>
                        <Input type="number" min="0" bind:value={match.game3Team2Points} />
                      </Table.Cell>
                      <Table.Cell>
                        {match.game3Team1Points > match.game3Team2Points
                          ? match.team1.name
                          : match.game3Team2Points > match.game3Team1Points
                            ? match.team2.name
                            : 'No winner yet'}
                      </Table.Cell>
                    </Table.Row>
                  {/if}
                </Table.Body>
              </Table.Root>
            </div>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    {/each}
  </Card.Content>
  <Card.Footer class="justify-center text-sm text-muted-foreground">
    {#if isLoadingMatches}
      <p>Loading....</p>
    {:else if matches.length === 0}
      <p>No match series found.</p>
    {/if}
  </Card.Footer>
</Card.Root>
