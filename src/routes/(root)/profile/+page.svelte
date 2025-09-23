<script lang="ts">
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import User from '@lucide/svelte/icons/user';
	import Loader from '@lucide/svelte/icons/loader';
	import ThemeToggle from '$lib/components/theme-toggle.svelte';
	import ModeToggle from '$lib/components/mode-toggle.svelte';

	import { toast } from 'svelte-sonner';
	import { z } from 'zod';
	import { onMount } from 'svelte';
	import { handleUserErrors, withErrorHandling } from '$lib';
	import { authClient } from '$lib/auth-client';
	import { page } from '$app/state';

	import type { PageData } from './$types';
	import type { UserSelectModel } from '$lib/server/db/types';
	import type { ApiResponse } from '$lib/types';

	export const profileFormSchema = z.object({
		username: z.string().min(2).max(50)
	});

	const { session } = page.data as PageData;

	let user: UserSelectModel | null = $state(null);
	let isLoading = $state(true);
	let isLoadingProfile = $state(false);

	// profile form
	let name = $state('');
	let image = $state('');

	// password form
	let currentPassword = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');

	const getUserProfile = async () => {
		isLoading = true;
		await withErrorHandling(async () => {
			const response = await fetch(`/api/users/${session.user.id}`);
			const data: ApiResponse<UserSelectModel> = await response.json();
			isLoading = false;

			if (data.success) {
				user = data.data;
				name = user?.name ?? '';
				image = user?.image ?? '';
			} else {
				handleUserErrors(data.error);
			}
		}, 'Error fetching user profile');
	};

	const updateProfile = async (event: Event) => {
		event.preventDefault();

		await withErrorHandling(async () => {
			isLoadingProfile = true;
			const { error } = await authClient.updateUser({
				name,
				image
			});
			isLoadingProfile = false;
			if (error) {
				toast.success('Error updating profile', {
					description: error.message || 'Something went wrong!'
				});
			} else {
				toast.success('Profile updated');
				if (user) {
					user.image = image;
					user.name = name;
				}
			}
		}, 'Error updating profile');
	};

	onMount(() => {
		getUserProfile();
	});
</script>

<section class="space-y-8">
	<header class="flex items-center gap-4">
		{#if isLoading}
			<Skeleton class="size-16 rounded-full" />
			<div>
				<Skeleton class="h-7 w-40 rounded-md" />
				<Skeleton class="mt-2 h-4 w-48 rounded-md" />
			</div>
		{:else if user}
			{#if user.image}
				<img
					src={user.image ?? '/default-avatar.png'}
					alt="User avatar"
					class="size-16 rounded-full border object-cover"
				/>
			{:else}
				<User size={64} class="rounded-full border" />
			{/if}
			<div>
				<h1 class="text-2xl font-bold">{user.name}</h1>
				<p class="text-sm text-muted-foreground">{user.email}</p>
			</div>
		{/if}
	</header>

	<section class="space-y-4">
		<h2 class="text-lg font-semibold">Make It Pop...</h2>
		<div class="flex items-end gap-2">
			<ThemeToggle />
			<ModeToggle />
		</div>
	</section>

	<!-- Update profile form -->
	<form class="max-w-md space-y-4" onsubmit={updateProfile}>
		<h2 class="text-lg font-semibold">Update Profile</h2>
		<div class="space-y-2">
			<Label for="profile-name">Name</Label>
			<Input type="text" id="profile-name" bind:value={name} />
		</div>
		<div class="space-y-2">
			<Label for="profile-image">Image URL</Label>
			<Input type="text" id="profile-image" bind:value={image} />
		</div>
		<Button type="submit" class="w-32">
			{#if isLoadingProfile}
				<Loader class="animate-spin" />
			{:else}
				Update Profile
			{/if}
		</Button>
	</form>
</section>
