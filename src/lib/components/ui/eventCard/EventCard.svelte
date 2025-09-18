<script lang="ts">
	import { Card, CardContent, CardFooter } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { MapPin, Calendar, Utensils, Award, Clock } from 'lucide-svelte';
	import type { Tables } from 'databasetypes';

	type Event = Tables<'events'>;

	let { event }: { event: Event } = $props();

	const formatDate = (date: string | null) =>
		date
			? new Date(date).toLocaleDateString('en-IN', {
					day: 'numeric',
					month: 'short'
				})
			: '';

	const formatTime = (time: string | null) => time || '';
</script>

<!-- Removed h-full so no ghost click area -->
<Card class="h-full w-full transition-all duration-200 hover:shadow-md">
	<CardContent class="space-y-4 p-6">
		<!-- Header -->
		<div class="space-y-2">
			<div class="flex items-start justify-between gap-3">
				<h3 class="line-clamp-2 text-left text-lg leading-tight font-semibold text-card-foreground">
					{event.title}
				</h3>
				{#if event.is_sold_out}
					<Badge variant="secondary" class="shrink-0 text-xs">Sold out</Badge>
				{:else}
					<Badge variant="outline" class="shrink-0 text-xs capitalize">
						{event.type}
					</Badge>
				{/if}
			</div>

			{#if event.department}
				<p class="text-left text-sm text-muted-foreground">
					{event.department}
				</p>
			{/if}
		</div>

		<!-- Event Details -->
		<div class="space-y-2 text-sm">
			<div class="flex items-center gap-2 text-left text-muted-foreground">
				<Calendar class="h-4 w-4 flex-shrink-0" />
				<div class="flex flex-wrap items-center gap-2">
					<span>{formatDate(event.start_date)}</span>
					{#if event.time}
						<Clock class="h-3 w-3 flex-shrink-0" />
						<span>{formatTime(event.time)}</span>
					{/if}
				</div>
			</div>
			<div class="flex items-center gap-2 text-left text-muted-foreground">
				<MapPin class="h-4 w-4 flex-shrink-0" />
				<span class="line-clamp-1 text-left">{event.location}</span>
			</div>
		</div>

		<!-- Description -->
		{#if event.description}
			<p class="line-clamp-2 text-left text-sm leading-relaxed text-muted-foreground">
				{event.description}
			</p>
		{/if}

		<!-- Perks -->
		{#if event.food_provided || event.od_provided || event.certificate_provided}
			<div class="flex flex-wrap justify-start gap-1.5 pt-2">
				{#if event.food_provided}
					<Badge variant="outline" class="text-xs">
						<Utensils class="mr-1 h-3 w-3" />
						Food
					</Badge>
				{/if}
				{#if event.od_provided}
					<Badge variant="outline" class="text-xs">
						<Award class="mr-1 h-3 w-3" />
						OD
					</Badge>
				{/if}
				{#if event.certificate_provided}
					<Badge variant="outline" class="text-xs">
						<Award class="mr-1 h-3 w-3" />
						Certificate
					</Badge>
				{/if}
			</div>
		{/if}
	</CardContent>

	<CardFooter class="px-6 py-4 pt-0">
		<div class="w-full space-y-3">
			<!-- Price and Capacity -->
			<div class="flex items-center justify-between">
				<div class="text-left text-lg font-semibold">
					{#if event.price !== null && event.price > 0}
						₹{event.price}
					{:else}
						<span class="text-green-600 dark:text-green-400">Free</span>
					{/if}
				</div>
				<div class="text-right text-sm text-muted-foreground">
					{event.booked_slots ?? 0}/{event.capacity ?? '∞'}
				</div>
			</div>

			<!-- Progress Bar -->
			{#if event.capacity}
				<div class="space-y-1">
					<div class="h-2 w-full overflow-hidden rounded-full bg-secondary">
						<div
							class="h-full rounded-full bg-primary transition-all duration-300"
							style="width: {Math.min(((event.booked_slots ?? 0) / event.capacity) * 100, 100)}%"
						></div>
					</div>
					<div class="flex justify-between text-xs text-muted-foreground">
						<span class="text-left">
							{event.capacity - (event.booked_slots ?? 0)} spots left
						</span>
						<span class="text-right">
							{Math.round(((event.booked_slots ?? 0) / event.capacity) * 100)}%
						</span>
					</div>
				</div>
			{/if}
		</div>
	</CardFooter>
</Card>
