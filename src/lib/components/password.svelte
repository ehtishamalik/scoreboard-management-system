<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import Loader from '@lucide/svelte/icons/loader';
	import EyeIcon from '@lucide/svelte/icons/eye';
	import EyeClosedIcon from '@lucide/svelte/icons/eye-closed';

	import { Label } from '$lib/components/ui/label/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { authClient } from '$lib/auth-client';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';

	import type { ApiResponse } from '$lib/types';
	import type { UserSelectModel } from '$lib/server/db/types';

	const id = $props.id();

	let isSignIn = $state<boolean>(true);
	let isLoading = $state<boolean>(false);
	let showPassword = $state<boolean>(false);

	const getAuthentication = ({
		name,
		email,
		password
	}: {
		name: string;
		email: string;
		password: string;
	}) => {
		if (isSignIn) {
			return authClient.signIn.email({
				email,
				password
			});
		} else {
			return authClient.signUp.email({
				name,
				email,
				password
			});
		}
	};

	const handleSubmit = async (event: Event) => {
		event.preventDefault();

		const form = event.currentTarget as HTMLFormElement;
		const formData = new FormData(form);

		const name = formData.get('name')?.toString().trim() || '';
		const email = formData.get('email')?.toString().trim() || '';
		const password = formData.get('password')?.toString() || '';
		const confirmPassword = formData.get('confirm-password')?.toString() || '';

		if (!isSignIn && password !== confirmPassword) {
			toast.error('Passwords do not match');
			return;
		}

		try {
			isLoading = true;
			if (isSignIn) {
				const response = await fetch(`/api/users?email=${email}`, {
					method: 'GET',
					headers: { 'Content-Type': 'application/json' }
				});
				const data: ApiResponse<UserSelectModel[]> = await response.json();

				if (!data.success) throw new Error('Failed to verify user.');

				if (data.data.length === 0) {
					toast.error('No account found with this email. Please sign up first.');
					isLoading = false;
					return;
				}

				if (data.data[0].isActive === false) {
					toast.error('Your account has been deactivated. Please contact admin.');
					isLoading = false;
					return;
				}
			}

			const { error } = await getAuthentication({ name, email, password });
			if (error && error.message) {
				toast.error(error.message);
			} else {
				toast.success(isSignIn ? 'Logged in successfully!' : 'Account created successfully!');
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
</script>

<form onsubmit={handleSubmit}>
	<Card.Root>
		<Card.Header class="text-center">
			<Card.Title>{isSignIn ? 'Login to your account' : 'Create an account'}</Card.Title>
			<Card.Description
				>{isSignIn
					? 'Enter your email below to login to your lycuscore account'
					: 'Enter your email below to create your account'}</Card.Description
			>
		</Card.Header>
		<Card.Content>
			<div class="flex flex-col gap-4">
				{#if !isSignIn}
					<div class="grid gap-2">
						<Label for="name-{id}">Name</Label>
						<Input
							id="name-{id}"
							type="text"
							placeholder="John Doe"
							name="name"
							autocomplete="on"
							required
						/>
					</div>
				{/if}

				<div class="grid gap-2">
					<Label for="email-{id}">Email</Label>
					<Input
						id="email-{id}"
						type="email"
						name="email"
						placeholder="m@lycusinc.com"
						autocomplete="on"
						required
					/>
				</div>

				<div class="space-y-2">
					<div class="flex items-center">
						<Label for="password">Password</Label>
						<a href="/auth/reset" class="ml-auto text-sm underline-offset-2 hover:underline">
							Forgot your password?
						</a>
					</div>
					<div class="flex">
						<Input
							id="password-{id}"
							placeholder="••••••••"
							type={showPassword ? 'text' : 'password'}
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
				{#if !isSignIn}
					<div class="grid gap-2">
						<Label for="confirm-password-{id}">Confirm Password</Label>
						<Input
							id="confirm-password-{id}"
							placeholder="••••••••"
							type={showPassword ? 'text' : 'password'}
							name="confirm-password"
							minlength={8}
							maxlength={128}
							autocomplete="on"
							required
						/>
					</div>
				{/if}
				<Button type="submit" class="w-full">
					{#if isLoading}
						<Loader class="animate-spin" />
					{:else}
						{isSignIn ? 'Login' : 'Sign up'}
					{/if}
				</Button>
				<div class="text-center text-sm">
					{isSignIn ? "Don't have an account?" : 'Already have an account?'}

					<button
						type="button"
						onclick={() => (isSignIn = !isSignIn)}
						class="cursor-pointer underline underline-offset-4"
					>
						{isSignIn ? 'Sign Up' : 'Login'}
					</button>
				</div>
			</div>
		</Card.Content>
		<Card.Footer></Card.Footer>
	</Card.Root>
</form>
