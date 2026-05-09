<script lang="ts">
  import * as Table from '$lib/components/ui/table/index.js';
  import * as Select from '$lib/components/ui/select/index.js';
  import * as Dialog from '$lib/components/ui/dialog/index.js';

  import HeadingCreator from '$lib/components/heading-creator.svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import Label from '$lib/components/ui/label/label.svelte';
  import Input from '$lib/components/ui/input/input.svelte';

  import { PlusIcon, RefreshCwIcon } from '@lucide/svelte/icons';
  import { Switch } from '$lib/components/ui/switch/index.js';
  import { Spinner } from '$lib/components/ui/spinner/index.js';
  import { handleUserErrors, withErrorHandling } from '$lib';
  import { onMount } from 'svelte';
  import { formateDate } from '$lib/utils';
  import { toast } from 'svelte-sonner';

  import type { UserSelectModel } from '$lib/server/db/types';
  import type { ApiResponse } from '$lib/types';

  const id = $props.id();

  let users = $state<UserSelectModel[]>([]);
  let isLoading = $state<boolean>(true);
  let isCreatingUser = $state<boolean>(false);
  let isDialogOpen = $state<boolean>(false);

  const getUsers = async () => {
    withErrorHandling(async () => {
      isLoading = true;
      const response = await fetch('/api/users', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      const data: ApiResponse<UserSelectModel[]> = await response.json();
      if (data.success) {
        users = data.data;
      } else {
        handleUserErrors(data.error);
      }
      isLoading = false;
    }, 'Error fetching users');
  };

  const UpdateUser = async (user: UserSelectModel) => {
    isLoading = true;
    await withErrorHandling(async () => {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });

      const data: ApiResponse<UserSelectModel> = await response.json();
      if (data.success) {
        users = users.map((u) => (u.id === user.id ? data.data : u));
        toast.success(`User ${user.name} updated successfully`);
      } else {
        handleUserErrors(data.error);
      }
    }, 'Error updating user');
    isLoading = false;
  };

  const handleCreateUser = async (event: Event) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;

    if (!name || !email) {
      toast.error('Name and Email are required.');
      return;
    }

    if (!email.endsWith('@ehtishamalik.com')) {
      toast.error('Email must be a @ehtishamalik.com address.');
      return;
    }

    isCreatingUser = true;
    await withErrorHandling(async () => {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email })
      });

      const data: ApiResponse<UserSelectModel> = await response.json();
      if (data.success) {
        users = [data.data, ...users];
        toast.success(`User ${name} created successfully`);
        form.reset();
        isDialogOpen = false;
      } else {
        handleUserErrors(data.error);
      }
    }, 'Error creating user');
    isCreatingUser = false;
  };

  const handleUserRoleChange = (userId: string) => async (newRole: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      user.role = newRole as 'USER' | 'COMMITTEE' | 'ADMIN';
      await UpdateUser(user);
    }
  };

  const handleUserActiveChange = (userId: string) => async (isActive: boolean) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      user.isActive = isActive;
      await UpdateUser(user);
    }
  };

  onMount(() => {
    getUsers();
  });
</script>

<section class="w-full">
  <HeadingCreator
    title="User Management"
    description="Manage users, their roles, and permissions within the application."
  >
    <Button variant="outline" size="icon" disabled={isLoading} onclick={getUsers}>
      <RefreshCwIcon class={{ 'animate-spin': isLoading }} />
    </Button>
    <Dialog.Root open={isDialogOpen} onOpenChange={(e) => (isDialogOpen = e)}>
      <Dialog.Trigger>
        {#snippet child({ props })}
          <Button {...props} disabled={isLoading}>
            <PlusIcon />
            Add user
          </Button>
        {/snippet}
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>Add New User</Dialog.Title>
          <Dialog.Description>
            These will be anonymous used only for participations that will not be able to log in to
            their accounts.
          </Dialog.Description>
        </Dialog.Header>
        <form class="space-y-4 py-4" onsubmit={handleCreateUser}>
          <div class="space-y-2">
            <Label for={`name-${id}`}>Name</Label>
            <Input
              type="text"
              id={`name-${id}`}
              name="name"
              placeholder="John Doe"
              autocomplete="off"
              required
            />
          </div>
          <div class="space-y-2">
            <Label for={`email-${id}`}>Email</Label>
            <Input
              type="email"
              id={`email-${id}`}
              name="email"
              placeholder="m@ehtishamalik.com"
              autocomplete="off"
              required
            />
          </div>
          <Button type="submit" class="w-full" disabled={isCreatingUser}>
            {#if isCreatingUser}
              <Spinner />
            {:else}
              Create User
            {/if}
          </Button>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  </HeadingCreator>
  <Table.Root>
    <Table.Caption>
      {#if isLoading}
        Loading....
      {:else if users.length === 0 && !isLoading}
        No users found.
      {/if}
    </Table.Caption>
    <Table.Header>
      <Table.Row>
        <Table.Head class="w-16">#</Table.Head>
        <Table.Head>Name</Table.Head>
        <Table.Head>Email</Table.Head>
        <Table.Head class="w-44">Role</Table.Head>
        <Table.Head class="w-24">Active</Table.Head>
        <Table.Head>Joined</Table.Head>
      </Table.Row>
    </Table.Header>
    <Table.Body>
      {#each users as user, index (user.id)}
        <Table.Row>
          <Table.Cell class="font-medium">{index + 1}</Table.Cell>
          <Table.Cell>{user.name}</Table.Cell>
          <Table.Cell>{user.email}</Table.Cell>
          <Table.Cell>
            {#key `${user.role}|${user.id}`}
              <Select.Root
                type="single"
                value={user.role}
                onValueChange={handleUserRoleChange(user.id)}
              >
                <Select.Trigger class="w-full" size="sm">{user.role}</Select.Trigger>
                <Select.Content>
                  <Select.Item value="USER">USER</Select.Item>
                  <Select.Item value="COMMITTEE">COMMITTEE</Select.Item>
                  <Select.Item value="ADMIN">ADMIN</Select.Item>
                </Select.Content>
              </Select.Root>
            {/key}
          </Table.Cell>
          <Table.Cell>
            <Switch
              bind:checked={user.isActive}
              onCheckedChange={handleUserActiveChange(user.id)}
            />
          </Table.Cell>
          <Table.Cell>{formateDate(user.createdAt)}</Table.Cell>
        </Table.Row>
      {/each}
    </Table.Body>
  </Table.Root>
</section>
