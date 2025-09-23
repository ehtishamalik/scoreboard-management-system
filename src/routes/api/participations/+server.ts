// src/routes/api/participations/+server.ts

import { participation, tournament, user } from '$lib/server/db/schema';
import { zodParticipationSchema, handleSchema } from '$lib/validation';
import { handleError, HttpError } from '$lib/server/error';
import { and, eq } from 'drizzle-orm';
import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';

import type { ParticipationSelectModel, ParticipationsWithUsers } from '$lib/server/db/types';
import type { RequestHandler } from './$types';
import type { ApiResponse } from '$lib/types';

/**
 * Handles GET requests to /api/participations
 * Supports filtering by userId and tournamentId query parameters.
 * Example: /api/participations?userId=abcde&tournamentId=xyz
 */
export const GET: RequestHandler = async ({ url }) => {
	try {
		const userId = url.searchParams.get('userId');
		const tournamentId = url.searchParams.get('tournamentId');

		const allParticipations = await db.query.participation.findMany({
			where: (p, { eq, and }) =>
				and(
					userId ? eq(p.userId, userId) : undefined,
					tournamentId ? eq(p.tournamentId, tournamentId) : undefined
				),
			with: {
				tournament: true,
				user: true
			}
		});

		const response: ApiResponse<ParticipationsWithUsers[]> = {
			success: true,
			data: allParticipations
		};
		return json(response, { status: 200 });
	} catch (error) {
		const { status, body } = handleError(error, 'Error getting participations');
		const response: ApiResponse<ParticipationSelectModel[]> = {
			success: false,
			error: body
		};
		return json(response, { status });
	}
};

/**
 * Handles POST requests to /api/participations
 * Creates a new participation record.
 */
export const POST: RequestHandler = async ({ url, request }) => {
	try {
		const body = await request.json();

		const { success, data, errors } = handleSchema(zodParticipationSchema, body);

		if (!success || !data) {
			throw new HttpError(400, `${errors.join(', ')}.`, 'Invalid participation data');
		}

		const verify = url.searchParams.get('verify');

		if (verify && verify === 'true') {
			const [userResult] = await db
				.select()
				.from(user)
				.where(and(eq(user.id, data.userId), eq(user.isActive, true)));

			if (!userResult) {
				throw new HttpError(404, 'User account has been deactivated.', 'User missing');
			}

			const [tournamentResult] = await db
				.select()
				.from(tournament)
				.where(and(eq(tournament.id, data.tournamentId), eq(tournament.isFinalized, false)));

			if (!tournamentResult) {
				throw new HttpError(
					404,
					'Tournament has been finalized. Please refresh the page.',
					'Tournament finalized'
				);
			}

			if (!tournamentResult.isActive) {
				throw new HttpError(404, 'Tournament is not active anymore.', 'Tournament completed');
			}

			const [existingParticipation] = await db
				.select()
				.from(participation)
				.where(
					and(
						eq(participation.userId, data.userId),
						eq(participation.tournamentId, data.tournamentId)
					)
				);

			if (existingParticipation) {
				throw new HttpError(
					404,
					'User is already registered for this tournament.',
					'User already registered'
				);
			}
		}

		const newParticipation = await db.insert(participation).values(data).returning();

		const response: ApiResponse<ParticipationSelectModel> = {
			success: true,
			data: newParticipation[0]
		};
		return json(response, { status: 201 });
	} catch (error) {
		const { status, body } = handleError(error, 'Error creating participation');
		const response: ApiResponse<ParticipationSelectModel> = {
			success: false,
			error: body
		};
		return json(response, { status });
	}
};
