<script lang="ts">
	import {
		NavigationMenuRoot,
		NavigationMenuList,
		NavigationMenuItem,
		NavigationMenuLink
	} from '$lib/components/ui/navigation-menu';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { Sheet, SheetContent, SheetTrigger } from '$lib/components/ui/sheet';
	import { Dialog, DialogContent, DialogTrigger } from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';

	import { Menu, Search, X } from 'lucide-svelte';
	import SunIcon from '@lucide/svelte/icons/sun';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import { toggleMode } from 'mode-watcher';

	const navItems = [
		{ href: '/', label: 'Home' },
		{ href: '/events', label: 'Events' },
		{ href: '/announcements', label: 'Announcements' },
		{ href: '/auditions', label: 'Auditions' }
	];

	let isSearchOpen = $state(false);
	let isMenuOpen = $state(false);
	let searchValue = $state('');

	function closeMenu() {
		isMenuOpen = false;
	}
	function closeSearch() {
		isSearchOpen = false;
		searchValue = '';
	}
	function handleSearch(event: Event) {
		event.preventDefault();
		console.log('Searching for:', searchValue);
		// TODO: integrate with search API
		closeSearch();
	}
</script>

<header
	class="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur transition-all duration-300 supports-[backdrop-filter]:bg-background/80"
>
	<div class="container flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-6">
		<!-- Logo + Mobile Menu -->
		<div class="flex items-center gap-3">
			<Sheet bind:open={isMenuOpen}>
				<SheetTrigger>
					{#snippet child({ props })}
						<div
							{...props}
							class={`${buttonVariants({ variant: 'ghost', size: 'icon' })} h-9 w-9 text-foreground md:hidden`}
						>
							<Menu class="h-5 w-5" />
							<span class="sr-only">Toggle menu</span>
						</div>
					{/snippet}
				</SheetTrigger>
				<SheetContent side="left" class="w-72 p-6">
					<div class="flex h-full flex-col">
						<!-- Close button -->
						<div class="flex items-center justify-between">
							<a href="/" class="flex items-center gap-2.5 text-xl font-bold">
								<span class="text-2xl">🔥</span>
								<span>EventHub</span>
							</a>
							<Button variant="ghost" size="icon" onclick={closeMenu}>
								<X class="h-5 w-5" />
								<span class="sr-only">Close menu</span>
							</Button>
						</div>

						<!-- Nav links -->
						<nav class="mt-8 flex flex-col space-y-1">
							{#each navItems as item}
								<a
									href={item.href}
									class="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
									onclick={closeMenu}
								>
									{item.label}
								</a>
							{/each}
						</nav>

						<!-- CTA at bottom -->
						<div class="mt-auto border-t pt-6">
							<Button href="/auth" class="w-full" size="lg">Get Started</Button>
						</div>
					</div>
				</SheetContent>
			</Sheet>

			<!-- Desktop Logo -->
			<a href="/" class="hidden items-center gap-2.5 text-xl font-bold md:flex">
				<span class="text-2xl">🔥</span>
				<span>EventHub</span>
			</a>
		</div>

		<!-- Desktop Navigation -->
		<NavigationMenuRoot class="hidden md:flex">
			<NavigationMenuList class="flex items-center space-x-1">
				{#each navItems as item}
					<NavigationMenuItem>
						<NavigationMenuLink
							href={item.href}
							class="inline-flex h-9 items-center rounded-md px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
						>
							{item.label}
						</NavigationMenuLink>
					</NavigationMenuItem>
				{/each}
			</NavigationMenuList>
		</NavigationMenuRoot>

		<!-- Right Actions -->
		<div class="flex items-center gap-2">
			<!-- Search Button -->
			<Dialog bind:open={isSearchOpen}>
				<DialogTrigger>
					{#snippet child({ props })}
						<div {...props} class={`${buttonVariants({ variant: 'ghost', size: 'icon' })} h-9 w-9`}>
							<Search class="h-4 w-4" />
							<span class="sr-only">Search</span>
						</div>
					{/snippet}
				</DialogTrigger>
				<DialogContent class="rounded-xl p-6 sm:max-w-lg">
					<div class="space-y-4">
						<div class="space-y-2">
							<h3 class="text-xl font-semibold tracking-tight">Search Events</h3>
							<p class="text-sm text-muted-foreground">
								Find events, announcements, auditions and more.
							</p>
						</div>
						<form onsubmit={handleSearch} class="space-y-4">
							<div class="relative">
								<Search
									class="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
								/>
								<Input
									bind:value={searchValue}
									placeholder="What are you looking for?"
									class="w-full py-2 pr-4 pl-10"
									autofocus
								/>
							</div>
							<div class="flex justify-end gap-3">
								<Button type="button" variant="outline" onclick={closeSearch} class="px-6">
									Cancel
								</Button>
								<Button type="submit" class="px-6">Search</Button>
							</div>
						</form>
					</div>
				</DialogContent>
			</Dialog>

			<!-- Desktop CTA -->
			<Button href="/auth" variant="default" size="sm" class="hidden md:inline-flex">
				Get Started
			</Button>

			<!-- Theme Toggle -->
			<Button
				onclick={toggleMode}
				variant="ghost"
				size="icon"
				class="h-9 w-9 transition-colors hover:bg-accent hover:text-accent-foreground"
			>
				<SunIcon
					class="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90"
				/>
				<MoonIcon
					class="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"
				/>
				<span class="sr-only">Toggle theme</span>
			</Button>
		</div>
	</div>
</header>
