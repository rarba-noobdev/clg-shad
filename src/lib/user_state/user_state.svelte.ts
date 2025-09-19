/**
 * User State Management Module
 * --------------------------
 * Provides centralized state management for user authentication and session handling
 * using Svelte's context API and Supabase authentication.
 *
 * Features:
 * - Reactive state management for user session
 * - Supabase client integration
 * - Authentication state persistence
 * - Type-safe database interactions
 * - Real-time state updates
 *
 * Usage:
 * ```typescript
 * // In a component
 * import { getUserState } from '$lib/userstate.svelte';
 *
 * let { user, session } = $derived(getUserState());
 * ```
 *
 * State Structure:
 * - session: Current user session
 * - user: Current user data
 * - supabase: Supabase client instance
 * - events: Cached events data
 *
 * @module userstate
 */

import type { Session, SupabaseClient, User } from '@supabase/supabase-js';
import { getContext, setContext } from 'svelte';
import type { Tables } from 'databasetypes';
import { toast } from 'svelte-sonner';

// Define the registration type based on the 'registrations' table
type Registration = Tables<'registrations'>;

// Define the insert type, excluding auto-generated fields
type RegistrationInsert = {
	event_id: string;
	status?: 'pending' | 'confirmed' | 'cancelled' | null;
	user_id: string;
};

/**
 * Interface representing the user state data structure
 * @interface userStateObject
 */
interface userStateObject {
	/** Current user session or null if not authenticated */
	session: Session | null;
	/** Current user data or null if not authenticated */
	user: User | null;
	/** Initialized Supabase client instance */
	supabase: SupabaseClient | null;
}

/**
 * Class managing global user state and authentication
 * @class UserState
 */
export class UserState {
	/** @private Current user session state */
	private _session = $state<Session | null>(null);
	/** @private Current user data state */
	private _user = $state<User | null>(null);
	/** @private Supabase client instance */
	private _supabase = $state<SupabaseClient | null>(null);

	/**
	 * Creates a new UserState instance
	 * @param userState Initial user state object
	 */
	constructor(userState: userStateObject) {
		this.updateState(userState);
	}

	/**
	 * Updates the current user state
	 * @param userState New user state object
	 */
	updateState(userState: userStateObject) {
		this._session = userState.session;
		this._user = userState.user;
		this._supabase = userState.supabase;
	}

	get session(): Session | null {
		return this._session;
	}

	get user(): User | null {
		return this._user;
	}

	get supabase(): SupabaseClient | null {
		return this._supabase;
	}

	/**
	 * Registers a user for an event
	 * @param event_id The ID of the event to register for
	 * @returns The inserted registration data or throws an error
	 * @throws Error if user is not logged in, Supabase client is unavailable, or insertion fails
	 */
	async register(event_id: string): Promise<Registration> {
		if (!this.user || !this.session) {
			toast.error('Please log in to register for an event');
			throw new Error('Please log in to register for an event');
		}
		if (!this.supabase) {
			toast.error('Supabase client is not available');
			throw new Error('Supabase client is not available');
		}

		const newRegistration: RegistrationInsert = {
			event_id,
			user_id: this.user.id,
			status: 'pending' // Default status; adjust as needed
		};

		// Pass the newRegistration object to the insert method
		const { data, error } = await this.supabase
			.from('registrations')
			.insert(newRegistration)
			.select()
			.single();

		if (error) {
			console.error('Registration error:', error);
			throw new Error(`Failed to register: ${error.message}`);
		}

		if (!data) {
			throw new Error('No data returned from registration');
		}

		return data;
	}

	async logOut() {
		await this._supabase?.auth.signOut();
	}
}

const UUIK = Symbol('userStateKey');

export const setUserState = (userState: userStateObject) => {
	return setContext(UUIK, new UserState(userState));
};

export const getUserState = (): UserState => {
	const userState = getContext(UUIK);
	if (!(userState instanceof UserState)) {
		throw new Error('UserState context not found or invalid.');
	}
	return userState;
};
