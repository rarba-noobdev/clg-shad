<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import SuperDebug, { superForm } from 'sveltekit-superforms';
	import type { PageData } from './$types';
	import { toast } from 'svelte-sonner';
	import { invalidateAll } from '$app/navigation';

	let { data }: { data: PageData } = $props();
	let authType = $state('login');

	function showErrors(errors: Record<string, string[] | undefined>) {
		for (const key of Object.keys(errors)) {
			const messages = errors[key];
			if (messages) {
				for (const msg of messages) {
					toast.error(msg);
				}
			}
		}
	}

	let loginLoadingToastId: string | number | undefined;
	let {
		form: loginForm,
		enhance: loginEnhance,
		submitting: loginSubmitting
	} = superForm(data.loginForm, {
		// Force full page reload
		invalidateAll: 'force',
		applyAction: true,
		onSubmit({ cancel }) {
			loginLoadingToastId = toast.loading('Logging In...');
		},
		onResult: async ({ result }) => {
			if (result.type === 'failure') {
				// Dismiss loading toast first
				toast.dismiss(loginLoadingToastId);
				// Only show specific field errors, not a general message
				if (result.data?.form?.errors) {
					showErrors(result.data.form.errors);
				} else {
					// Fallback if no specific errors
					toast.error('Login validation failed');
				}
			} else if (result.type === 'success') {
				toast.success('Login successful', { id: loginLoadingToastId });
				// Force full page reload
				await invalidateAll();
				// Or use window.location.reload() for a hard refresh
				window.location.reload();
			} else if (result.type === 'redirect') {
				// Let SvelteKit handle the redirect, which will do a full navigation
				toast.success('Login successful', { id: loginLoadingToastId });
			}
		},
		onUpdated({ form }) {
			if (form.message) {
				toast.success(form.message);
			}
			// Removed error handling from here to prevent duplicates
		},
		onError({ result }) {
			toast.error('Login failed. Please try again.', { id: loginLoadingToastId });
		}
	});

	let registerLoadingToastId: string | number | undefined;
	let {
		form: registerForm,
		enhance: registerEnhance,
		submitting: registerSubmitting
	} = superForm(data.registerForm, {
		// Force full page reload
		invalidateAll: 'force',
		applyAction: true,
		resetForm: false,
		onSubmit({ cancel }) {
			registerLoadingToastId = toast.loading('Registering...');
		},
		onResult: async ({ result }) => {
			if (result.type === 'failure') {
				// Dismiss loading toast first
				toast.dismiss(registerLoadingToastId);
				// Only show specific field errors, not a general message
				if (result.data?.form?.errors) {
					showErrors(result.data.form.errors);
				} else {
					// Fallback if no specific errors
					toast.error('Registration validation failed');
				}
			} else if (result.type === 'success') {
				toast.success('Registration successful', { id: registerLoadingToastId });
				// Switch to login after successful registration
				authType = 'login';
				window.location.reload();
				await invalidateAll();
			} else if (result.type === 'redirect') {
				// Let SvelteKit handle the redirect
				toast.success('Registration successful', { id: registerLoadingToastId });
			}
		},
		onUpdated({ form }) {
			if (form.message) {
				toast.success(form.message);
			}
			// Removed error handling from here to prevent duplicates
		},
		onError({ result }) {
			toast.error('Registration failed. Please try again.', { id: registerLoadingToastId });
		}
	});
</script>

<div class="flex h-screen w-full items-center justify-center px-4">
	<Card.Root class="mx-auto w-full max-w-sm">
		<Card.Header>
			<Card.Title class="text-2xl">
				{authType === 'register' ? 'Register' : 'Login'}
			</Card.Title>
			<Card.Description>
				Enter your email below to {authType === 'register' ? 'register' : 'login'} to your account.
			</Card.Description>
		</Card.Header>

		<Card.Content>
			{#if authType === 'register'}
				<!-- Registration form -->
				<form method="POST" action="?/register" use:registerEnhance class="grid gap-4">
					<div class="grid gap-2">
						<Label for="register-email">Email</Label>
						<Input
							bind:value={$registerForm.email}
							id="register-email"
							name="email"
							type="email"
							placeholder="m@example.com"
							required
						/>
					</div>

					<div class="grid gap-2">
						<Label for="register-password">Password</Label>
						<Input
							bind:value={$registerForm.password}
							id="register-password"
							name="password"
							type="password"
							required
						/>
					</div>

					<div class="grid gap-2">
						<Label for="register-confirm-password">Confirm Password</Label>
						<Input
							bind:value={$registerForm.confirmPassword}
							id="register-confirm-password"
							name="confirmPassword"
							type="password"
							required
						/>
					</div>

					<Button type="submit" class="w-full">Register</Button>
				</form>
			{:else}
				<!-- Login form -->
				<form method="POST" action="?/login" use:loginEnhance class="grid gap-4">
					<div class="grid gap-2">
						<Label for="login-email">Email</Label>
						<Input
							bind:value={$loginForm.email}
							id="login-email"
							name="email"
							type="email"
							placeholder="m@example.com"
							required
						/>
					</div>

					<div class="grid gap-2">
						<div class="flex items-center">
							<Label for="login-password">Password</Label>
							<a href="/forgot-password" class="ml-auto inline-block text-sm underline">
								Forgot your password?
							</a>
						</div>
						<Input
							bind:value={$loginForm.password}
							id="login-password"
							name="password"
							type="password"
							required
						/>
					</div>

					<Button type="submit" class="w-full">Login</Button>
				</form>

				<!-- Fixed Google OAuth form -->
				<form method="POST" class="mt-4">
					<input type="hidden" name="provider" value="google" />
					<Button
						formaction="?/oauth&provider=google"
						variant="outline"
						class="w-full"
						type="submit"
					>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="mr-2 h-4 w-4">
							<path
								d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
								fill="currentColor"
							/>
						</svg>
						Login with Google
					</Button>
				</form>
			{/if}

			<div class="mt-4 text-center text-sm">
				{authType === 'register' ? 'Already have an account?' : 'New to our platform?'}
				<Button
					onclick={() => {
						authType = authType === 'register' ? 'login' : 'register';
					}}
					class="underline"
					variant="link"
				>
					{authType === 'register' ? 'Sign in' : 'Sign up'}
				</Button>
			</div>
		</Card.Content>
	</Card.Root>
</div>

<SuperDebug data={authType === 'login' ? $loginForm : $registerForm} />
