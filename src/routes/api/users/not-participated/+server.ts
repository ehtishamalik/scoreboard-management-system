// src/routes/api/users/not-participated/+server.ts

import { participation, user } from '$lib/server/db/schema';
import { handleError, HttpError } from '$lib/server/error';
import { eq, and, notInArray } from 'drizzle-orm';
import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';

import type { UserSelectModel } from '$lib/server/db/types';
import type { RequestHandler } from './$types';
import type { ApiResponse } from '$lib/types';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const tournamentId = url.searchParams.get('tournamentId');

		if (!tournamentId) {
			throw new HttpError(400, 'tournamentId parameter is required.', 'Missing parameter');
		}

		// Get userIds already participating in this tournament
		const participants = await db
			.select({ userId: participation.userId })
			.from(participation)
			.where(eq(participation.tournamentId, tournamentId));

		const participantIds = participants.map((p) => p.userId);

		// Fetch active users not in participantIds
		const availableUsers = await db
			.select()
			.from(user)
			.where(
				and(
					eq(user.isActive, true),
					participantIds.length > 0 ? notInArray(user.id, participantIds) : undefined
				)
			);

		const response: ApiResponse<typeof availableUsers> = {
			success: true,
			data: availableUsers
		};
		return json(response, { status: 200 });
	} catch (error) {
		const { status, body } = handleError(error, 'Error getting users not in tournament');

		const response: ApiResponse<UserSelectModel[]> = {
			success: false,
			error: body
		};
		return json(response, { status });
	}
};
