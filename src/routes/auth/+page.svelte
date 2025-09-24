<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import Loader from '@lucide/svelte/icons/loader';
	import EyeIcon from '@lucide/svelte/icons/eye';
	import EyeClosedIcon from '@lucide/svelte/icons/eye-closed';

	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { authClient } from '$lib/auth-client';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';

	const id = $props.id();

	let userEmail = $state<string>('hannahward@ehtishamalik.com');
	let userPassword = $state<string>('password1234');
	let isLoading = $state<boolean>(false);
	let showPassword = $state<boolean>(false);

	const handleSubmit = async (event: Event) => {
		event.preventDefault();

		try {
			isLoading = true;

			const { error } = await authClient.signIn.email({
				email: userEmail,
				password: userPassword
			});
			if (error && error.message) {
				toast.error(error.message);
			} else {
				toast.success('Logged in successfully!');
				goto('/');
			}
		} catch (error) {
			console.error(error);
			toast.error('An unexpected error occurred. Please try again.', {
				description: (error as Error).message
			});
		} finally {
			isLoading = false;
		}
	};

	const handleReset = () => {
		toast.warning('Feature coming soon!');
	};
</script>

<form onsubmit={handleSubmit} class="flex h-screen w-full items-center justify-center px-4">
	<Card.Root class="w-full max-w-md">
		<Card.Header class="text-center">
			<Card.Title>Login to your account</Card.Title>
			<Card.Description
				>Enter your email below to login to your scoreboard account.
				<br />
				Just click login to continue, a demo account is pre-filled for you.
			</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="flex flex-col gap-4">
				<div class="grid gap-2">
					<Label for="email-{id}">Email</Label>
					<Input
						id="email-{id}"
						type="email"
						name="email"
						bind:value={userEmail}
						placeholder="m@ehtishamalik.com"
						autocomplete="on"
						required
					/>
				</div>

				<div class="space-y-2">
					<div class="flex items-center">
						<Label for="password">Password</Label>
						<button
							onclick={handleReset}
							type="button"
							class="ml-auto text-sm underline-offset-2 hover:underline"
						>
							Forgot your password?
						</button>
					</div>
					<div class="flex">
						<Input
							id="password-{id}"
							placeholder="••••••••"
							type={showPassword ? 'text' : 'password'}
							bind:value={userPassword}
							name="password"
							minlength={8}
							maxlength={128}
							autocomplete="on"
							class="rounded-tr-none rounded-br-none"
							required
						/>
						<Button
							variant="outline"
							class="cursor-pointer rounded-tl-none rounded-bl-none"
							onclick={() => (showPassword = !showPassword)}
						>
							{#if showPassword}
								<EyeClosedIcon class="opacity-80 hover:opacity-100" />
								<span class="sr-only">Hide password</span>
							{:else}
								<EyeIcon class="opacity-100" />
								<span class="sr-only">Show password</span>
							{/if}
						</Button>
					</div>
				</div>
				<Button type="submit" class="w-full">
					{#if isLoading}
						<Loader class="animate-spin" />
					{:else}
						{'Login'}
					{/if}
				</Button>
			</div>
		</Card.Content>
		<Card.Footer></Card.Footer>
	</Card.Root>
</form>
<Toaster />
