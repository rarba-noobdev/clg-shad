<script lang="ts">
	import {
		NavigationMenuRoot,
		NavigationMenuList,
		NavigationMenuItem,
		NavigationMenuLink
	} from '$lib/components/ui/navigation-menu';
	import { Button } from '$lib/components/ui/button';
	import { Sheet, SheetContent, SheetTrigger } from '$lib/components/ui/sheet';
	import { Dialog, DialogContent, DialogTrigger } from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';

	import { Menu, Search } from 'lucide-svelte';
	import SunIcon from '@lucide/svelte/icons/sun';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import { toggleMode } from 'mode-watcher';

	// Navigation items
	const navItems = [
		{ href: '/', label: 'Home' },
		{ href: '/events', label: 'Events' },
		{ href: '/announcements', label: 'Announcements' },
		{ href: '/auditions', label: 'Auditions' }
	];

	// Svelte 5 state
	let isSearchOpen = $state(false);
	let isMenuOpen = $state(false);
	let searchValue = $state('');

	// Function to close the menu
	function closeMenu() {
		isMenuOpen = false;
	}

	// Function to close the search dialog
	function closeSearch() {
		isSearchOpen = false;
		searchValue = '';
	}

	// Handle search submit
	function handleSearch(event: Event) {
		event.preventDefault();
		// Add your search logic here
		console.log('Searching for:', searchValue);
		closeSearch();
	}
</script>

<header
	class="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
>
	<div class="container flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-8">
		<!-- Mobile menu and logo -->
		<div class="flex items-center gap-3">
			<!-- Mobile menu trigger -->
			<Sheet bind:open={isMenuOpen}>
				<SheetTrigger>
					{#snippet child({ props })}
						<Button {...props} variant="ghost" size="icon" class="h-9 w-9 md:hidden">
							<Menu class="h-5 w-5" />
							<span class="sr-only">Toggle menu</span>
						</Button>
					{/snippet}
				</SheetTrigger>
				<SheetContent side="left" class="w-80 p-5">
					<div class="mt-8 flex flex-col space-y-6">
						<div class="flex items-center gap-2">
							<span class="text-2xl">☠️</span>
							<span class="text-xl font-bold tracking-tight">MyApp</span>
						</div>
						<nav class="flex flex-col space-y-4">
							{#each navItems as item}
								<a
									href={item.href}
									class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
									onclick={closeMenu}
								>
									{item.label}
								</a>
							{/each}
						</nav>
						<div class="border-t pt-6">
							<Button href="/login" class="w-full" size="sm">Get Started</Button>
						</div>
					</div>
				</SheetContent>
			</Sheet>

			<!-- Logo -->
			<a href="/" class="flex items-center gap-2">
				<span class="text-2xl">☠️</span>
				<span class="text-xl font-bold tracking-tight">MyApp</span>
			</a>
		</div>

		<!-- Desktop navigation -->
		<NavigationMenuRoot class="hidden md:flex">
			<NavigationMenuList class="flex items-center space-x-1">
				{#each navItems as item}
					<NavigationMenuItem>
						<NavigationMenuLink
							href={item.href}
							class="group active inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"
						>
							{item.label}
						</NavigationMenuLink>
					</NavigationMenuItem>
				{/each}
			</NavigationMenuList>
		</NavigationMenuRoot>

		<!-- Right side actions -->
		<div class="flex items-center space-x-2">
			<!-- Search Dialog -->
			<Dialog bind:open={isSearchOpen}>
				<DialogTrigger>
					{#snippet child({ props })}
						<div
							{...props}
							class="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-sm font-medium whitespace-nowrap ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
						>
							<Search class="h-4 w-4" />
							<span class="sr-only">Search</span>
						</div>
					{/snippet}
				</DialogTrigger>
				<DialogContent class="sm:max-w-lg">
					<div class="space-y-4">
						<div class="space-y-2">
							<h3 class="text-lg font-medium">Search</h3>
							<p class="text-sm text-muted-foreground">
								Search through our content and documentation.
							</p>
						</div>
						<form onsubmit={handleSearch} class="space-y-4">
							<div class="relative">
								<Search
									class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
								/>
								<Input
									bind:value={searchValue}
									placeholder="Type to search..."
									class="pr-4 pl-10"
									autofocus
								/>
							</div>
							<div class="flex justify-end space-x-2">
								<Button type="button" variant="outline" onclick={closeSearch}>Cancel</Button>
								<Button type="submit">Search</Button>
							</div>
						</form>
					</div>
				</DialogContent>
			</Dialog>

			<!-- Login button for desktop -->
			<Button href="/auth" variant="default" size="sm" class="hidden md:inline-flex">
				Get Started
			</Button>

			<!-- Theme toggle -->
			<Button onclick={toggleMode} variant="outline" size="icon">
				<SunIcon
					class="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 !transition-all dark:scale-0 dark:-rotate-90"
				/>
				<MoonIcon
					class="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 !transition-all dark:scale-100 dark:rotate-0"
				/>
				<span class="sr-only">Toggle theme</span>
			</Button>
		</div>
	</div>
</header>
