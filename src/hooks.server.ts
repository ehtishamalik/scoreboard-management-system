import { auth } from '$lib/server/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { building } from '$app/environment';

import type { Handle } from '@sveltejs/kit';
import type { ApiResponse, RoleType } from '$lib/types';

const protectedCommitteeApiRoutes = ['/api/matches', '/api/teams', '/api/tournaments'];
const protectedAdminApiRoutes = ['/api/users'];

const protectedMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

const adminRole: RoleType[] = ['ADMIN'];
const committeeRole: RoleType[] = ['COMMITTEE', 'ADMIN'];

export const handle: Handle = async ({ event, resolve }) => {
	const session = await auth.api.getSession({
		headers: event.request.headers
	});

	if (session) {
		event.locals = {
			...event.locals,
			session: session.session,
			user: session.user
		};
	}

	// Middleware-like check
	const { pathname } = event.url;
	const method = event.request.method;

	// If it's one of the protected APIs AND not a GET request
	if (
		protectedCommitteeApiRoutes.some((route) => pathname.startsWith(route)) &&
		protectedMethods.has(method)
	) {
		if (!session || !committeeRole.includes(session.user.role)) {
			const response: ApiResponse<null> = {
				success: false,
				error: { cause: 'Forbidden', message: 'You do not have permission to perform this action.' }
			};
			return new Response(JSON.stringify(response), { status: 403 });
		}
	}

	if (
		protectedAdminApiRoutes.some((route) => pathname.startsWith(route)) &&
		protectedMethods.has(method)
	) {
		if (!session || !adminRole.includes(session.user.role)) {
			const response: ApiResponse<null> = {
				success: false,
				error: { cause: 'Forbidden', message: 'You do not have permission to perform this action.' }
			};
			return new Response(JSON.stringify(response), { status: 403 });
		}
	}

	return svelteKitHandler({ event, resolve, auth, building });
};
