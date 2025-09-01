<script lang="ts">
	import '../app.css';
	import Navbar from '$lib/components/Navbar.svelte';
	import { ModeWatcher } from 'mode-watcher';
	import { afterNavigate, beforeNavigate, goto, invalidate, replaceState } from '$app/navigation';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import { getUserState, setUserState } from '$lib/user_state/user_state.svelte';
	import '@bprogress/core/css';
	import { BProgress } from '@bprogress/core';
	import { page } from '$app/state';
	import { toast } from 'svelte-sonner';

	BProgress.configure({ showSpinner: false, easing: 'ease', speed: 1000 });

	let { data, children } = $props();
	let { session, supabase } = $derived(data);
	let oauthCheck = $derived(page.url.searchParams.get('oauth'));
	let user = $derived(getUserState());

	const userState = setUserState({
		session: data.session,
		supabase: data.supabase,
		user: data.user
	});

	// Function to clean up OAuth parameters from URL
	function cleanupOAuthParams() {
		const url = new URL(page.url);
		const hasOAuthParams =
			url.searchParams.has('code') ||
			url.searchParams.has('oauth') ||
			url.searchParams.has('state') ||
			url.searchParams.has('error');

		if (hasOAuthParams) {
			// Remove OAuth-related parameters
			url.searchParams.delete('code');
			url.searchParams.delete('oauth');
			url.searchParams.delete('state');
			url.searchParams.delete('error');
			url.searchParams.delete('error_description');

			// Update URL without reload
			replaceState(url.toString(), {});
		}
	}

	$effect(() => {
		const { data } = supabase.auth.onAuthStateChange((_, newSession) => {
			console.log('Auth state changed');

			if (oauthCheck && newSession) {
				toast.success('Login Successful');
				// Clean up OAuth parameters after successful login
				cleanupOAuthParams();
			}

			userState.updateState({
				session: newSession,
				supabase: supabase,
				user: newSession?.user || null
			});

			if (newSession?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		return () => data.subscription.unsubscribe();
	});

	// Also clean up on initial load if there are OAuth params but user is already logged in
	$effect(() => {
		if (user.session && (page.url.searchParams.has('code') || page.url.searchParams.has('oauth'))) {
			cleanupOAuthParams();
		}
	});

	beforeNavigate(() => {
		BProgress.start();
	});

	afterNavigate(() => {
		BProgress.done();
	});
</script>

<ModeWatcher />
<Navbar />
<Toaster richColors expand={true} closeButton position="top-right" />
{@render children?.()}
