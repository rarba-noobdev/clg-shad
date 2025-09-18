import type { LayoutLoad } from './$types';
import type { Tables } from 'databasetypes';

type Event = Tables<'events'>;

export const load: LayoutLoad = async ({ parent }) => {
	const { supabase } = await parent();

	// Fetch events data with proper error handling
	const { data, error } = (await supabase.from('events').select('*')) as {
		data: Event[] | null;
		error: any;
	};

	if (error) {
		console.error('Error fetching events:', error);
		// Return empty array or throw error based on your needs
		return {
			events: []
		};
	}

	// Return the data to make it available to child routes
	return {
		events: data || []
	};
};
