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
	 * @param eventId The ID of the event to register for
	 */
	async register(eventId: string) {
		if (!this.supabase) {
			toast.error('Supabase client is not initialized.');
			return;
		}

		// ✅ Always fetch the latest user from Supabase Auth
		const {
			data: { user },
			error: userError
		} = await this.supabase.auth.getUser();
		if (userError || !user) {
			toast.error('Please log in to register.');
			return;
		}

		try {
			const registration: RegistrationInsert = {
				user_id: user.id, // ✅ always use Supabase auth user.id
				event_id: eventId,
				status: 'pending'
			};

			const { error } = await this.supabase.from('registrations').insert(registration);

			if (error) {
				toast.error('Failed to register: ' + error.message);
				return;
			}

			toast.success('Successfully registered for the event!');
		} catch (err) {
			toast.error('An error occurred during registration.');
			console.error('Registration error:', err);
		}
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
