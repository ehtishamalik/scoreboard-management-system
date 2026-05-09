<script lang="ts">
  import * as Card from '$lib/components/ui/card/index.js';
  import * as Table from '$lib/components/ui/table/index.js';
  import RefreshIcon from '@lucide/svelte/icons/refresh-cw';
  import Button from '$lib/components/ui/button/button.svelte';

  import { handleUserErrors, withErrorHandling } from '$lib';

  import type { ApiResponse, TournamentStanding } from '$lib/types';
  import clsx from 'clsx';

  let {
    tournamentId,
    isActive = false
  }: {
    tournamentId: string;
    isActive?: boolean;
  } = $props();

  let standings = $state<TournamentStanding[]>([]);

  let isLoading = $state<boolean>(true);
  let loadedAlready = $state<boolean>(false);

  const getAllStandings = async () => {
    isLoading = true;
    await withErrorHandling(async () => {
      const response = await fetch(`/api/standings/${tournamentId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      const data: ApiResponse<TournamentStanding[]> = await response.json();
      if (data.success) {
        standings = data.data;
      } else {
        handleUserErrors(data.error);
      }
    }, 'Error fetching standings');
    isLoading = false;
  };

  $effect(() => {
    if (isActive && !loadedAlready) {
      getAllStandings();
      loadedAlready = true;
    }
  });
</script>

<Card.Root class="transition-all">
  <Card.Header>
    <Card.Title class="flex items-center justify-between gap-4">
      <h1 class="text-2xl">Standings</h1>
      <Button variant="outline" size="icon" disabled={isLoading} onclick={getAllStandings}>
        <RefreshIcon class={{ 'animate-spin': isLoading }} />
      </Button>
    </Card.Title>
    <Card.Description class="flex flex-col gap-1">
      <p>Total Standings: {isLoading ? 'counting...' : standings.length}</p>
    </Card.Description>
  </Card.Header>
  <Card.Content>
    <Table.Root>
      {#if isLoading}
        <Table.Caption>Loading....</Table.Caption>
      {:else if standings.length === 0}
        <Table.Caption>No standings available.</Table.Caption>
      {/if}
      <Table.Header>
        <Table.Row>
          <Table.Head class="w-8">#</Table.Head>
          <Table.Head>Team Name</Table.Head>
          <Table.Head>Total</Table.Head>
          <Table.Head>Wins</Table.Head>
          <Table.Head>Losses</Table.Head>
          <Table.Head>Points</Table.Head>
          <Table.Head>Difference</Table.Head>
          <Table.Head>For</Table.Head>
          <Table.Head>Against</Table.Head>
          <Table.Head>Win (%)</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {#each standings as { teamId, teamName, W, L, PCT, PF, PA, PD, PTS }, index (teamId)}
          <Table.Row
            class={clsx({
              'bg-linear-to-r from-chart-1/10 to-chart-5/10': index === 0 && standings.length > 1, // Highlight first place when total teams are more than 1.
              'bg-linear-to-r from-chart-2/10 to-chart-4/10': index === 1 && standings.length > 2, // Highlight second place when total teams are more than 2.
              'bg-linear-to-r from-chart-3/10 to-chart-1/10': index === 2 && standings.length > 4, // Highlight third place when total teams are more than 4.
              'bg-linear-to-r from-chart-4/10 to-chart-2/10': index === 3 && standings.length > 4 // Highlight fourth place when total teams are more than 4.
            })}
          >
            <Table.Cell>
              {index + 1}</Table.Cell
            >
            <Table.Cell>{teamName}</Table.Cell>
            <Table.Cell>{W + L}</Table.Cell>
            <Table.Cell>{W}</Table.Cell>
            <Table.Cell>{L}</Table.Cell>
            <Table.Cell>{PTS}</Table.Cell>
            <Table.Cell>{PD}</Table.Cell>
            <Table.Cell>{PF}</Table.Cell>
            <Table.Cell>{PA}</Table.Cell>
            <Table.Cell>{PCT}%</Table.Cell>
          </Table.Row>
        {/each}
      </Table.Body>
    </Table.Root>
  </Card.Content>
</Card.Root>
