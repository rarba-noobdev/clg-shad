<script lang="ts">
	import '../app.css';
	import Navbar from '$lib/components/Navbar.svelte';
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from 'svelte-french-toast';
	import { afterNavigate, beforeNavigate, invalidate } from '$app/navigation';
	import { setUserState } from '$lib/user_state/user_state.svelte';
	import '@bprogress/core/css';
	import { BProgress } from '@bprogress/core';
	BProgress.configure({ showSpinner: false, easing: 'ease', speed: 1000 });
	let { data, children } = $props();
	let { session, supabase } = $derived(data);

	const userState = setUserState({
		session: data.session,
		supabase: data.supabase,
		user: data.user
	});

	$effect(() => {
		const { data } = supabase.auth.onAuthStateChange((_, newSession) => {
			console.log('Auth state changed');
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
	beforeNavigate(() => {
		BProgress.start();
	});
	afterNavigate(() => {
		BProgress.done();
	});
</script>

<ModeWatcher />
<Navbar />
{@render children?.()}
<Toaster position={'top-right'} />
