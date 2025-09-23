<script lang="ts">
	import { onMount } from 'svelte';

	let isOffline = $state<boolean | null>(null);

	const updateStatus = () => {
		isOffline = !navigator.onLine;
	};

	onMount(() => {
		setTimeout(() => {
			updateStatus();
		}, 1000); // Delay to allow initial load

		window.addEventListener('online', updateStatus);
		window.addEventListener('offline', updateStatus);

		return () => {
			window.removeEventListener('online', updateStatus);
			window.removeEventListener('offline', updateStatus);
		};
	});
</script>

{#if isOffline}
	<div
		class="mb-8 rounded-lg border bg-yellow-50 p-4 text-sm text-yellow-800 dark:bg-neutral-800 dark:text-yellow-300"
		role="alert"
	>
		⚠️ You are offline — showing cached data!
	</div>
{/if}
