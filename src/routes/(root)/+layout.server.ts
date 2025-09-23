import { auth } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';

import type { LayoutServerLoad } from './$types';
import type { ApiResponse } from '$lib/types';
import type { TournamentSelectModel, UserSelectModel } from '$lib/server/db/types';

export const load: LayoutServerLoad = async ({ fetch, request }) => {
	const session = await auth.api.getSession({
		query: {
			disableCookieCache: true
		},
		headers: request.headers
	});

	if (session) {
		const response = await fetch(`/api/users?email=${session.user.email}&isActive=true`, {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' }
		});
		const data: ApiResponse<UserSelectModel[]> = await response.json();
		const user = data.success && data.data.length > 0 ? data.data[0] : null;

		if (!user) {
			await auth.api.signOut({
				headers: request.headers
			});
			throw redirect(302, '/');
		}
	}

	const response = await fetch('/api/tournaments', {
		method: 'GET',
		headers: { 'Content-Type': 'application/json' }
	});

	const tournaments: ApiResponse<TournamentSelectModel[]> = await response.json();

	return {
		session,
		tournaments: tournaments.success ? tournaments.data : []
	};
};
