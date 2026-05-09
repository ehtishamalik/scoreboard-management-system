<script lang="ts">
  import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
  import Button from './ui/button/button.svelte';
  import BellIcon from '@lucide/svelte/icons/bell';

  import { Spinner } from '$lib/components/ui/spinner/index.js';
  import { handleUserErrors, withErrorHandling } from '$lib';
  import { toast } from 'svelte-sonner';

  let isSending = $state<boolean>(false);
  let isAlertOpen = $state<boolean>(false);

  const handleAlertSend = async () => {
    isAlertOpen = false;
    isSending = true;

    await withErrorHandling(async () => {
      const response = await fetch('/api/push/notify', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        toast.success('Notifications sent successfully!', {
          description: data.data
        });
      } else {
        handleUserErrors(data.error);
      }
    }, 'Error sending notifications');
    isSending = false;
  };
</script>

<AlertDialog.Root open={isAlertOpen} onOpenChange={(open) => (isAlertOpen = open)}>
  <AlertDialog.Trigger>
    {#snippet child({ props })}
      <Button variant="secondary" {...props} disabled={isSending}>
        {#if isSending}
          <Spinner />
        {:else}
          <BellIcon />
        {/if}
        Notify Users</Button
      >
    {/snippet}
  </AlertDialog.Trigger>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>Are you sure?</AlertDialog.Title>
      <AlertDialog.Description>
        This will send notifications to all users about the match they will play today. Please
        confirm to proceed.
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
      <AlertDialog.Action onclick={handleAlertSend}>Continue</AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
