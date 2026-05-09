<script lang="ts">
  import * as Card from '$lib/components/ui/card/index.js';
  import { Badge } from '$lib/components/ui/badge/index.js';

  import Button from '$lib/components/ui/button/button.svelte';
  import PulseDot from '$lib/components/pulse-dot.svelte';

  import {
    ArrowRightIcon,
    UsersIcon,
    CalendarIcon,
    CheckIcon,
    UserIcon,
    MinusIcon,
    PlusIcon
  } from '@lucide/svelte/icons';
  import { Spinner } from '$lib/components/ui/spinner/index.js';
  import { handleUserErrors, withErrorHandling } from '$lib';
  import { formateDate } from '$lib/utils';
  import { blur } from 'svelte/transition';
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
    if (tournament.isFinalized) return;

    let lastFetchTime = 0;
    const THROTTLE_MS = 10_000; // 10 seconds

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

<Card.Root
  class="group relative flex flex-col justify-between gap-4 overflow-hidden transition-all duration-300 hover:border-chart-1/30 hover:bg-muted/30"
>
  <Card.Header>
    <Card.Title class="text-xl font-bold tracking-tight">
      {tournament.name}
    </Card.Title>

    <Card.Action>
      {#if tournament.isFinalized && !tournament.isStarted}
        <Badge variant="chart-5">
          <CheckIcon />
          Finalized
        </Badge>
      {:else if tournament.isStarted}
        <Badge variant="chart-4"><PulseDot className="bg-chart-4/50" />Live</Badge>
      {:else}
        <Badge variant="chart-1">Open</Badge>
      {/if}
    </Card.Action>

    <Card.Description class="mt-2 flex items-center gap-2">
      <div class="rounded-full bg-muted/50 p-1.5 backdrop-blur-sm">
        <CalendarIcon class="size-3.5 text-muted-foreground" />
      </div>
      <p class="text-sm font-medium tracking-tight text-muted-foreground">
        {formateDate(tournament.startDate, 'No start date')}
        <span class="mx-1 text-muted-foreground/30">—</span>
        {formateDate(tournament.endDate, 'No end date')}
      </p>
    </Card.Description>
  </Card.Header>

  <Card.Content>
    <div class="space-y-4">
      <div class="flex items-center gap-2">
        <Badge variant="chart-2">
          {isLoadingAllParticipations ? '...' : participations.length}
          Participants
        </Badge>
        <Badge variant="chart-3">
          {#if tournament.isSinglePlayer}
            <UserIcon />
            Single Player
          {:else}
            <UsersIcon />
            Double Player
          {/if}
        </Badge>
      </div>

      <div class="flex items-center">
        {#if isLoadingAllParticipations}
          <div class="flex -space-x-2">
            {#each Array(5) as _}
              <div
                class="size-8 animate-pulse rounded-full border-2 border-background bg-muted"
              ></div>
            {/each}
          </div>
        {:else}
          <div class="flex -space-x-2 overflow-hidden">
            {#each participations.slice(0, 8) as { id, user } (id)}
              <div class="relative" transition:blur>
                {#if user?.image}
                  <img
                    src={user.image}
                    alt={user.name}
                    class="size-8 rounded-full border-2 border-background object-cover"
                  />
                {:else}
                  <div
                    class="flex size-8 items-center justify-center rounded-full border-2 border-background bg-muted"
                  >
                    <UserIcon class="size-4 text-muted-foreground" />
                  </div>
                {/if}
              </div>
            {/each}
            {#if participations.length > 8}
              <div
                class="flex size-8 items-center justify-center rounded-full border-2 border-background bg-secondary text-[8px] font-bold"
              >
                +{participations.length - 8}
              </div>
            {/if}
            {#if participations.length === 0}
              <p class="py-1 text-[10px] text-muted-foreground italic">No participants yet</p>
            {/if}
          </div>
        {/if}
      </div>
    </div>
  </Card.Content>

  <Card.Footer class="justify-between">
    <Button href={`/tournament/${tournament.slug}`} variant="link"
      >View Tournament <ArrowRightIcon />
    </Button>
    <div class="flex gap-2">
      {#if session && !tournament.isFinalized}
        {#if !userParticipation}
          <Button
            onclick={handleAddParticipation}
            variant="default"
            disabled={isLoading || isLoadingParticipation}
          >
            {#if isLoading || isLoadingParticipation}
              <Spinner />
            {:else}
              <PlusIcon class="mr-1 size-3.5" />
              Join
            {/if}
          </Button>
        {:else}
          <Button
            onclick={handleRemoveParticipation}
            variant="outline"
            disabled={isLoading || isLoadingParticipation}
          >
            {#if isLoading || isLoadingParticipation}
              <Spinner />
            {:else}
              <MinusIcon class="mr-1 size-3" />
              Leave
            {/if}
          </Button>
        {/if}
      {/if}
    </div>
  </Card.Footer>
</Card.Root>
