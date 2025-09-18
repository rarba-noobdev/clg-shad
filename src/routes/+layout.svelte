<script lang="ts">
	import '../app.css';
	import Navbar from '$lib/components/Navbar.svelte';
	import { ModeWatcher } from 'mode-watcher';
	import { invalidate, goto } from '$app/navigation';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import { setUserState } from '$lib/user_state/user_state.svelte';
	import '@bprogress/core/css';
	import { toast } from 'svelte-sonner';
	import { page } from '$app/state';
	let { data, children } = $props();
	let { session, supabase } = $derived(data);
	let oauthCheck = $derived(page.url.searchParams.get('oauth'));

	const userState = setUserState({
		session: data.session,
		supabase: data.supabase,
		user: data.user
	});

	$effect(() => {
		const { data: subscription } = supabase.auth.onAuthStateChange((_, newSession) => {
			console.log('Auth state changed', newSession?.user);
			userState.updateState({
				session: newSession,
				supabase: supabase,
				user: newSession?.user || null
			});
			if (newSession?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
			if (oauthCheck) {
				toast.success('Logged In Successfully');
				// Remove oauth parameter and update URL
				const newUrl = new URL(page.url);
				newUrl.searchParams.delete('oauth');
				goto(newUrl.toString(), { replaceState: true });
			}
		});
		return () => subscription.subscription.unsubscribe();
	});
</script>

<ModeWatcher />

<Navbar />

<Toaster richColors expand={true} closeButton position="top-right" />

{@render children?.()}
