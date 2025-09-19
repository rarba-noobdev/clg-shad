/**
 * User State Management Module
 * ----------------------------
 * Provides centralized state management for user authentication and session handling
 * using Svelte's context API and Supabase authentication.
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
 */
interface userStateObject {
	session: Session | null;
	user: User | null;
	supabase: SupabaseClient | null;
}

/**
 * Class managing global user state and authentication
 */
export class UserState {
	private _session = $state<Session | null>(null);
	private _user = $state<User | null>(null);
	private _supabase = $state<SupabaseClient | null>(null);

	constructor(userState: userStateObject) {
		this.updateState(userState);
	}

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
			status: 'pending'
		};

		// ✅ Use array for insert to avoid errors
		const { data, error } = await this.supabase
			.from('registrations')
			.insert([newRegistration])
			.select();

		if (error) {
			console.error('Registration error (full):', error);
			toast.error(`Failed to register: ${error.message}`);
			throw new Error(`Failed to register: ${error.message}`);
		}

		if (!data || data.length === 0) {
			throw new Error('No data returned from registration');
		}

		// ✅ Supabase returns an array, grab the first row
		return data[0] as Registration;
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
