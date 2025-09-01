<script lang="ts">
	import '../app.css';
	import Navbar from '$lib/components/Navbar.svelte';
	import { ModeWatcher } from 'mode-watcher';
	import { afterNavigate, beforeNavigate, goto, invalidate, replaceState } from '$app/navigation';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import { getUserState, setUserState } from '$lib/user_state/user_state.svelte';
	import '@bprogress/core/css';
	import { BProgress } from '@bprogress/core';
	import { page } from '$app/stores';
	import { toast } from 'svelte-sonner';
	import type { LayoutData } from './$types';
	import type { SupabaseClient, Session, User, AuthChangeEvent } from '@supabase/supabase-js';

	// Define props type for layout
	interface Props {
		data: LayoutData;
		children?: () => any;
	}

	// Destructure props (no type argument needed for $props)
	const { data, children } = $props();

	// Configure BProgress globally
	BProgress.configure({ showSpinner: false, easing: 'ease', speed: 1000 });

	// Initialize user state
	const userState = setUserState({
		session: data.session,
		supabase: data.supabase,
		user: data.user
	});

	// Function to clean up OAuth parameters from URL
	function cleanupOAuthParams() {
		const url = new URL($page.url);
		const hasOAuthParams =
			url.searchParams.has('code') ||
			url.searchParams.has('oauth') ||
			url.searchParams.has('state') ||
			url.searchParams.has('error');

		if (hasOAuthParams) {
			url.searchParams.delete('code');
			url.searchParams.delete('oauth');
			url.searchParams.delete('state');
			url.searchParams.delete('error');
			url.searchParams.delete('error_description');
			replaceState(url.toString(), {}); // Use empty object {} for state
		}
	}

	// Handle auth state changes and OAuth cleanup
	$effect(() => {
		const { data: subscription } = data.supabase.auth.onAuthStateChange(
			(event: AuthChangeEvent, newSession: Session | null) => {
				console.log('Auth state changed:', event);

				// Show toast and clean up OAuth params on successful login
				if ($page.url.searchParams.get('oauth') && newSession) {
					toast.success('Login Successful');
					cleanupOAuthParams();
				}

				// Update user state
				userState.updateState({
					session: newSession,
					supabase: data.supabase,
					user: newSession?.user || null
				});

				// Invalidate auth if session expiration changes
				if (newSession?.expires_at !== data.session?.expires_at) {
					invalidate('supabase:auth');
				}
			}
		);

		// Clean up OAuth params on initial load if user is already logged in
		if (
			userState.session &&
			($page.url.searchParams.get('code') || $page.url.searchParams.get('oauth'))
		) {
			cleanupOAuthParams();
		}

		// Cleanup subscription
		return () => subscription.subscription.unsubscribe();
	});

	// Handle navigation progress bar
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
