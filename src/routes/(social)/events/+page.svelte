<script lang="ts">
	import EventCard from '$lib/components/ui/eventCard/EventCard.svelte';
	import type { PageProps } from './$types';
	import { getUserState } from '$lib/user_state/user_state.svelte';
	let { data }: PageProps = $props();
	let { events } = data;

	import { Button } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Calendar, MapPin, Users, Clock } from 'lucide-svelte';
	let userState = getUserState();
	let { user, register } = $derived(userState);
</script>

<main class="min-h-screen bg-background">
	<!-- Header -->
	<div class="border-b">
		<div class="container mx-auto px-4 py-8 md:px-6 lg:px-8">
			<div class="space-y-2">
				<h1 class="text-3xl font-bold tracking-tight">Upcoming Events</h1>
				<p class="text-muted-foreground">
					Discover and register for events, workshops, and activities
				</p>
			</div>
		</div>
	</div>

	<div class="container mx-auto px-4 py-8 md:px-6 lg:px-8">
		{#if events && events.length > 0}
			<!-- Quick Stats -->
			<div class="mb-8 flex flex-wrap gap-6 text-sm text-muted-foreground">
				<div class="flex items-center gap-2">
					<span class="font-medium text-foreground">{events.length}</span>
					<span>total events</span>
				</div>
				<div class="flex items-center gap-2">
					<span class="font-medium text-green-600">
						{events.filter((e) => !e.is_sold_out).length}
					</span>
					<span>available</span>
				</div>
				<div class="flex items-center gap-2">
					<span class="font-medium text-blue-600">
						{events.filter((e) => e.price === 0 || !e.price).length}
					</span>
					<span>free</span>
				</div>
			</div>

			<!-- Events Grid -->
			<div class="grid auto-rows-fr gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{#each events as event (event.id ?? `event-${events.indexOf(event)}`)}
					<Dialog.Root>
						<Dialog.Trigger>
							<EventCard {event} />
						</Dialog.Trigger>

						<Dialog.Content class="max-w-2xl">
							<Dialog.Header>
								<div class="flex items-start justify-between gap-4">
									<div class="space-y-2">
										<Dialog.Title class="text-left text-2xl leading-tight font-bold">
											{event.title}
										</Dialog.Title>
										{#if event.department}
											<p class="text-sm text-muted-foreground">{event.department}</p>
										{/if}
									</div>
									<div class="flex shrink-0 flex-col gap-2">
										{#if event.is_sold_out}
											<Badge variant="secondary">Sold out</Badge>
										{:else}
											<Badge variant="outline" class="capitalize">{event.type}</Badge>
										{/if}
										{#if event.price === 0 || !event.price}
											<Badge variant="outline" class="border-green-200 text-green-600">Free</Badge>
										{/if}
									</div>
								</div>
							</Dialog.Header>

							<div class="space-y-6">
								<!-- Event Details -->
								<div class="grid gap-4 text-sm">
									<div class="flex items-center gap-3">
										<Calendar class="h-4 w-4 text-muted-foreground" />
										<span>{event.start_date}</span>
										{#if event.time}
											<Clock class="ml-2 h-3 w-3 text-muted-foreground" />
											<span class="text-muted-foreground">{event.time}</span>
										{/if}
									</div>
									<div class="flex items-center gap-3">
										<MapPin class="h-4 w-4 text-muted-foreground" />
										<span>{event.location}</span>
									</div>
									<div class="flex items-center gap-3">
										<Users class="h-4 w-4 text-muted-foreground" />
										<span>
											{event.booked_slots ?? 0} / {event.capacity ?? '∞'} registered
										</span>
										{#if event.capacity}
											<span class="text-muted-foreground">
												({event.capacity - (event.booked_slots ?? 0)} spots left)
											</span>
										{/if}
									</div>
								</div>

								<!-- Description -->
								{#if event.description}
									<div class="space-y-2">
										<h3 class="font-semibold">About</h3>
										<p class="text-sm leading-relaxed text-muted-foreground">
											{event.description}
										</p>
									</div>
								{/if}

								<!-- Details Grid -->
								<div class="grid gap-4 text-sm sm:grid-cols-2">
									{#if event.managed_by}
										<div>
											<dt class="font-medium">Organized by</dt>
											<dd class="text-muted-foreground">{event.managed_by}</dd>
										</div>
									{/if}
									{#if event.price !== null && event.price > 0}
										<div>
											<dt class="font-medium">Price</dt>
											<dd class="text-muted-foreground">₹{event.price}</dd>
										</div>
									{/if}
								</div>

								<!-- Requirements -->
								{#if event.requirements}
									<div class="space-y-2">
										<h3 class="font-semibold">Requirements</h3>
										<p class="rounded-md bg-muted p-3 text-sm text-muted-foreground">
											{event.requirements}
										</p>
									</div>
								{/if}

								<!-- Perks -->
								{#if event.food_provided || event.certificate_provided || event.od_provided}
									<div class="space-y-2">
										<h3 class="font-semibold">What's included</h3>
										<div class="flex flex-wrap gap-2">
											{#if event.food_provided}
												<Badge variant="outline" class="text-xs">Food provided</Badge>
											{/if}
											{#if event.certificate_provided}
												<Badge variant="outline" class="text-xs">Certificate</Badge>
											{/if}
											{#if event.od_provided}
												<Badge variant="outline" class="text-xs">OD provided</Badge>
											{/if}
										</div>
									</div>
								{/if}

								<!-- Progress -->
								{#if event.capacity}
									<div class="space-y-2">
										<div class="flex justify-between text-sm">
											<span class="text-muted-foreground">Registration progress</span>
											<span class="font-medium">
												{Math.round(((event.booked_slots ?? 0) / event.capacity) * 100)}%
											</span>
										</div>
										<div class="h-2 overflow-hidden rounded-full bg-secondary">
											<div
												class="h-full rounded-full bg-primary transition-all duration-300"
												style="width: {Math.min(
													((event.booked_slots ?? 0) / event.capacity) * 100,
													100
												)}%"
											></div>
										</div>
									</div>
								{/if}
							</div>

							<Dialog.Footer>
								<Dialog.Close>
									<Button variant="outline">Close</Button>
								</Dialog.Close>
								<Button
									disabled={event.is_sold_out || !user}
									onclick={() => {
										userState.register(event.id);
									}}
								>
									{event.is_sold_out ? 'Sold Out' : 'Register'}
								</Button>
							</Dialog.Footer>
						</Dialog.Content>
					</Dialog.Root>
				{/each}
			</div>
		{:else}
			<!-- Empty State -->
			<div class="flex flex-col items-center justify-center py-12 text-center">
				<div class="mb-4 text-4xl text-muted-foreground/50">📅</div>
				<h3 class="mb-2 text-lg font-semibold">No events available</h3>
				<p class="max-w-sm text-muted-foreground">Check back soon for new events and activities.</p>
			</div>
		{/if}
	</div>
</main>
