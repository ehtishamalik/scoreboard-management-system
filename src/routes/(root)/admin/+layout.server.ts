import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';

export const load: LayoutServerLoad = async ({ request }) => {
	const session = await auth.api.getSession({
		headers: request.headers
	});

	if (!session || !(session.user.role === 'ADMIN')) {
		throw redirect(302, '/');
	}

	return {
		session
	};
};
