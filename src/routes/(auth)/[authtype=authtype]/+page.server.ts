import { superValidate, message, setError } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import sanitizeHtml from 'sanitize-html';
import type { Provider } from '@supabase/supabase-js';

// =========================
// Schemas
// =========================

const registerSchema = z
	.object({
		email: z
			.string({ message: 'Email is required' })
			.email({ message: 'Please enter a valid email address' })
			.max(255, { message: 'Email must not exceed 255 characters' })
			.refine((val) => !val.includes(' '), { message: 'Email cannot contain spaces' })
			.transform((val) => sanitizeHtml(val.toLowerCase().trim())),
		password: z
			.string({ message: 'Password is required' })
			.min(8, { message: 'Password must be at least 8 characters long' })
			.max(50, { message: 'Password must not exceed 50 characters' })
			.regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
			.regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
			.regex(/[0-9]/, { message: 'Password must contain at least one number' })
			.regex(/[^A-Za-z0-9]/, { message: 'Password must contain at least one special character' })
			.refine((val) => !val.includes(' '), { message: 'Password cannot contain spaces' }),
		confirmPassword: z.string({ message: 'Password confirmation is required' })
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Passwords do not match',
		path: ['confirmPassword']
	});

const loginSchema = z.object({
	email: z
		.string({ message: 'Email is required' })
		.email({ message: 'Please enter a valid email address' })
		.max(255, { message: 'Email must not exceed 255 characters' })
		.refine((val) => !val.includes(' '), { message: 'Email cannot contain spaces' })
		.transform((val) => sanitizeHtml(val.toLowerCase().trim())),
	password: z
		.string({ message: 'Password is required' })
		.min(1, { message: 'Password is required' })
});

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	const registerForm = await superValidate(zod(registerSchema));
	const loginForm = await superValidate(zod(loginSchema));

	return {
		registerForm,
		loginForm
	};
};

export const actions: Actions = {
	oauth: async ({ url, locals: { supabase } }) => {
		const provider = url.searchParams.get('provider') as Provider;

		if (!provider) {
			return fail(400, { error: 'Provider is required' });
		}

		try {
			console.log(url.origin);

			const { data, error } = await supabase.auth.signInWithOAuth({
				provider,
				options: {
					redirectTo: `${url.origin}/auth/callback`
				}
			});

			if (error) {
				console.error('OAuth error:', error);
				return fail(400, { error: error.message });
			}

			if (data.url) {
				throw redirect(302, data.url);
			}
		} catch (err: any) {
			if (err?.status === 302) {
				throw err; // Re-throw redirect
			}
			console.error('OAuth error:', err);
			return fail(500, { error: 'OAuth initialization failed' });
		}
	},
	login: async ({ request, url, locals: { supabase } }) => {
		const form = await superValidate(request, zod(loginSchema));
		if (!form.valid) {
			return fail(400, { form });
		}
		try {
			const { data, error } = await supabase.auth.signInWithPassword({
				email: form.data.email,
				password: form.data.password
			});

			if (error) {
				// Attach Supabase error to email field
				setError(form, 'email', error.message);
				return fail(400, { form });
			}

			if (!data.user) {
				setError(form, 'email', 'Login failed. Please try again');
				return fail(400, { form });
			}

			return message(form, 'Login successful! Welcome back.');
		} catch (err: any) {
			return fail(500, {
				form,
				error: err?.message ?? 'Unexpected error'
			});
		}
	},

	register: async ({ request, locals: { supabase } }) => {
		const form = await superValidate(request, zod(registerSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			const { data, error } = await supabase.auth.signUp({
				email: form.data.email,
				password: form.data.password
			});

			if (error) {
				// Attach Supabase error to email field
				setError(form, 'email', error.message);
				return fail(400, { form });
			}

			if (!data.user) {
				setError(form, 'email', 'Registration failed. Please try again');
				return fail(400, { form });
			}

			return message(form, 'Registration successful! Welcome to our platform.');
		} catch (err: any) {
			return fail(500, {
				form,
				error: err?.message ?? 'Unexpected error'
			});
		}
	}
};
