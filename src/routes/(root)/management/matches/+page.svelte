<script lang="ts">
  import * as Tabs from '$lib/components/ui/tabs/index.js';
  import NotifyUsers from '$lib/components/notify-users.svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import Card from './card.svelte';
  import HeadingCreator from '$lib/components/heading-creator.svelte';
  import NotAvailableBanner from '$lib/components/not-available-banner.svelte';

  import { BellIcon, BellOffIcon } from '@lucide/svelte/icons';

  import { page } from '$app/state';
  import { onMount } from 'svelte';

  import type { PageData } from './$types';

  const { tournaments } = page.data as PageData;

  let allowNotifications = $state<boolean>(true);

  const activeFinalizedTournaments = $derived(
    tournaments.filter((t) => t.isActive && t.isFinalized)
  );

  const handleAllowNotificationsChange = () => {
    allowNotifications = !allowNotifications;
    localStorage.setItem('allowMatchNotifications', JSON.stringify(allowNotifications));
  };

  onMount(() => {
    const storedPreference = localStorage.getItem('allowMatchNotifications');
    if (storedPreference !== null) {
      allowNotifications = JSON.parse(storedPreference);
    }
  });
</script>

<section>
  <HeadingCreator
    title="Manage Matches"
    description="Create or auto generate matches in bulk using the round robin format for your tournaments."
  >
    <Button size="icon" variant="outline" onclick={handleAllowNotificationsChange}>
      {#if allowNotifications}
        <BellIcon />
      {:else}
        <BellOffIcon />
      {/if}
    </Button>
    <NotifyUsers />
  </HeadingCreator>
  {#if activeFinalizedTournaments.length === 0}
    <NotAvailableBanner
      title="No active tournaments available at the moment."
      description="Please make sure the tournaments are created and finalized to manage matches."
    />
  {:else}
    <Tabs.Root value={activeFinalizedTournaments[0]?.id} class="w-full">
      <Tabs.List class="w-full">
        {#each activeFinalizedTournaments as tournament (tournament.id)}
          <Tabs.Trigger value={tournament.id}>{tournament.name}</Tabs.Trigger>
        {/each}
      </Tabs.List>
      {#each activeFinalizedTournaments as tournament (tournament.id)}
        <Tabs.Content value={tournament.id}>
          <Card {tournament} {allowNotifications} />
        </Tabs.Content>
      {/each}
    </Tabs.Root>
  {/if}
</section>
