<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import Logout from '@lucide/svelte/icons/log-out';
	import OfflineBanner from '$lib/components/offline-banner.svelte';
	import AppSidebar from '$lib/components/app-sidebar.svelte';
	import Loader from '@lucide/svelte/icons/loader';
	import UserIcon from '@lucide/svelte/icons/user';
	import Button from '$lib/components/ui/button/button.svelte';

	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import { ModeWatcher } from 'mode-watcher';
	import { page } from '$app/state';
	import { authClient } from '$lib/auth-client';

	import type { LayoutData } from './$types';
	import { toast } from 'svelte-sonner';

	const { session } = page.data as LayoutData;

	let { children } = $props();

	let isLoading = $state<boolean>(false);

	const handleOAuth = async () => {
		try {
			const { data, error } = await authClient.signIn.social({
				provider: 'google'
			});

			if (error) {
				toast.error(error.message || 'Failed to initiate Google OAuth. Please try again.');
			}
		} catch (error) {
			console.error(error);
			toast.error('An unexpected error occurred. Please try again.', {
				description: (error as Error).message
			});
		}
	};

	const handleLogout = async () => {
		isLoading = true;
		try {
			await authClient.signOut();
		} catch (err) {
			console.error(err);
		} finally {
			isLoading = false;
			window.location.reload();
		}
	};
</script>

<Sidebar.Provider>
	<AppSidebar {session} />
	<section class="w-full">
		<section class="flex h-16 items-center justify-between border-b border-border bg-sidebar px-4">
			<Sidebar.Trigger />
			<div class="flex items-center gap-4">
				{#if session}
					<Button size="icon" href="/profile" variant="outline">
						<UserIcon />
					</Button>
					<Button size="icon" variant="outline" onclick={handleLogout} disabled={isLoading}>
						{#if isLoading}
							<Loader class="animate-spin" />
						{:else}
							<Logout />
						{/if}
					</Button>
				{:else}
					<Button type="button" variant="secondary" class="cursor-pointer" onclick={handleOAuth}>
						<img src="/icons/google.svg" alt="Google Icon" />
						Login</Button
					>
				{/if}
			</div>
		</section>
		<main class="p-4">
			<OfflineBanner />
			{@render children?.()}
		</main>
	</section>
	<Toaster />
	<ModeWatcher />
</Sidebar.Provider>
