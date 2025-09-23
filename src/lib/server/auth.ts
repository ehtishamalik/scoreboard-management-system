import * as schema from '$lib/server/db/schema/auth-schema';

import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { user as UserTable } from './db/schema/auth-schema';
import { customSession } from 'better-auth/plugins';
import { getRequestEvent } from '$app/server';
import { env } from '$env/dynamic/private';
import { betterAuth } from 'better-auth';
import { eq } from 'drizzle-orm';
import { db } from './db';

export const auth = betterAuth({
	secret: env.BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, {
		provider: 'pg',
		schema
	}),
	emailAndPassword: {
		enabled: true,
		autoSignIn: true
	},
	session: {
		cookieCache: {
			enabled: true,
			maxAge: 24 * 60 * 60 // Cache duration in seconds
		}
	},
	plugins: [
		sveltekitCookies(getRequestEvent),
		customSession(async ({ user, session }) => {
			const [userRole] = await db
				.select({
					role: UserTable.role
				})
				.from(UserTable)
				.where(eq(UserTable.id, session.userId));

			return {
				user: {
					...user,
					role: userRole.role
				},
				session
			};
		})
	],
	...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
		? {
				socialProviders: {
					google: {
						prompt: 'select_account consent',
						accessType: 'offline',
						clientId: env.GOOGLE_CLIENT_ID,
						clientSecret: env.GOOGLE_CLIENT_SECRET
					}
				}
			}
		: {})
});
