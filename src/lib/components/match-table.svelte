<script lang="ts">
  import * as Table from '$lib/components/ui/table/index.js';

  import { formateDate } from '$lib/utils';

  import type { MatchWithDetails } from '$lib/server/db/types';
  import type { SelectedColumns } from '$lib/types';

  let {
    matches,
    selectedColumns,
    isLoading = false,
    teamClickCallback
  }: {
    matches: MatchWithDetails[];
    selectedColumns: SelectedColumns;
    isLoading?: boolean;
    teamClickCallback?: (teamName: string) => void;
  } = $props();

  const handleTeamClick = (teamName: string) => {
    if (teamClickCallback) {
      teamClickCallback(teamName);
    }
  };
</script>

<Table.Root>
  {#if isLoading}
    <Table.Caption>Loading....</Table.Caption>
  {:else if matches.length === 0}
    <Table.Caption>No match created yet.</Table.Caption>
  {/if}
  <Table.Header>
    <Table.Row>
      <Table.Head class="w-8">#</Table.Head>
      {#if selectedColumns.includes('team_1')}
        <Table.Head>Team One</Table.Head>
      {/if}
      {#if selectedColumns.includes('team_1_points')}
        <Table.Head>Points</Table.Head>
      {/if}
      {#if selectedColumns.includes('team_2')}
        <Table.Head>Team Two</Table.Head>
      {/if}
      {#if selectedColumns.includes('team_2_points')}
        <Table.Head>Points</Table.Head>
      {/if}
      {#if selectedColumns.includes('winner')}
        <Table.Head>Winner</Table.Head>
      {/if}
      {#if selectedColumns.includes('play_date')}
        <Table.Head>Play Date</Table.Head>
      {/if}
    </Table.Row>
  </Table.Header>

  <Table.Body>
    {#each matches as { id, playDate, team1, team2, team1Points, team2Points, winner, team1Id, team2Id, winnerId }, index (id)}
      <Table.Row>
        <Table.Cell>{index + 1}</Table.Cell>
        {#if selectedColumns.includes('team_1')}
          <Table.Cell
            class={{ 'cursor-pointer': true, 'text-emerald-600': winnerId === team1Id }}
            title={`Search by ${team1.name}`}
            onclick={() => handleTeamClick(team1.name)}>{team1.name}</Table.Cell
          >
        {/if}
        {#if selectedColumns.includes('team_1_points')}
          <Table.Cell>{team1Points}</Table.Cell>
        {/if}
        {#if selectedColumns.includes('team_2')}
          <Table.Cell
            class={{ 'cursor-pointer': true, 'text-emerald-600': winnerId === team2Id }}
            title={`Search by ${team2.name}`}
            onclick={() => handleTeamClick(team2.name)}>{team2.name}</Table.Cell
          >
        {/if}
        {#if selectedColumns.includes('team_2_points')}
          <Table.Cell>{team2Points}</Table.Cell>
        {/if}
        {#if selectedColumns.includes('winner')}
          <Table.Cell class={{ 'text-pink-800': !winnerId }}>
            {winner?.name || 'No winner yet'}
          </Table.Cell>
        {/if}
        {#if selectedColumns.includes('play_date')}
          <Table.Cell>{formateDate(playDate)}</Table.Cell>
        {/if}
      </Table.Row>
    {/each}
  </Table.Body>
</Table.Root>
