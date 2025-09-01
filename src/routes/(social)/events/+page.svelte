<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { getUserState } from '$lib/user_state/user_state.svelte';

	let userContext = getUserState();
	let { user } = $derived(userContext);
</script>

{#if user}
	<Button
		onclick={() => {
			userContext.logOut();
		}}>Log Out</Button
	>
{/if}
