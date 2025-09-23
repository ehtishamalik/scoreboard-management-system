// src/routes/api/participations/[id]/+server.ts

import { zodParticipationSchema, handleSchema } from '$lib/validation';
import { handleError, HttpError } from '$lib/server/error';
import { participation } from '$lib/server/db/schema';
import { tournament } from '$lib/server/db/schema';
import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { and } from 'drizzle-orm';
import { eq } from 'drizzle-orm';

import type { ParticipationSelectModel, ParticipationsWithUsers } from '$lib/server/db/types';
import type { RequestHandler } from './$types';
import type { ApiResponse } from '$lib/types';

/**
 * Handles GET requests for a single participations by ID.
 * Example: /api/participations/clrvj8r7o000010m5p4n1m7x
 */
export const GET: RequestHandler = async ({ params }) => {
	try {
		const participations = await db.query.participation.findMany({
			where: (_, { eq }) => eq(participation.id, params.id),
			with: {
				user: true,
				tournament: true
			}
		});

		if (participations.length === 0) {
			throw new HttpError(
				404,
				'No Participation with the given ID exists.',
				'Participation missing'
			);
		}

		const response: ApiResponse<ParticipationsWithUsers> = {
			success: true,
			data: participations[0]
		};

		return json(response, { status: 200 });
	} catch (error) {
		const { status, body } = handleError(error, 'Error getting participation with ID');

		const response: ApiResponse<ParticipationsWithUsers> = {
			success: false,
			error: body
		};
		return json(response, { status });
	}
};

/**
 * Handles PUT requests to update a participations by ID.
 * Example: /api/participations/clrvj8r7o000010m5p4n1m7x
 */
export const PUT: RequestHandler = async ({ params, request }) => {
	try {
		const body = await request.json();

		const { success, data, errors } = handleSchema(zodParticipationSchema, body);

		if (!success || !data) {
			throw new HttpError(400, `${errors.join(', ')}.`, 'Invalid participation data');
		}

		const updatedparticipation = await db
			.update(participation)
			.set(data)
			.where(eq(participation.id, params.id))
			.returning();

		if (updatedparticipation.length === 0) {
			throw new HttpError(
				404,
				'No Participation with the given ID exists.',
				'Participation missing'
			);
		}

		const response: ApiResponse<ParticipationSelectModel> = {
			success: true,
			data: updatedparticipation[0]
		};

		return json(response);
	} catch (error) {
		const { status, body } = handleError(error, 'Error updating participation');

		const response: ApiResponse<ParticipationsWithUsers> = {
			success: false,
			error: body
		};
		return json(response, { status });
	}
};

/**
 * Handles DELETE requests to delete a participations by ID.
 * Example: /api/participations/clrvj8r7o000010m5p4n1m7x
 */
export const DELETE: RequestHandler = async ({ url, params }) => {
	try {
		const verify = url.searchParams.get('verify');
		const tournamentId = url.searchParams.get('tournamentId');

		if (verify && verify === 'true' && tournamentId) {
			const [tournamentResult] = await db
				.select()
				.from(tournament)
				.where(and(eq(tournament.id, tournamentId), eq(tournament.isFinalized, false)));

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
		}

		const deletedParticipation = await db
			.delete(participation)
			.where(eq(participation.id, params.id))
			.returning();

		if (deletedParticipation.length === 0) {
			throw new HttpError(
				404,
				'No Participation with the given ID exists.',
				'Participation missing'
			);
		}

		const response: ApiResponse<ParticipationSelectModel> = {
			success: true,
			data: deletedParticipation[0]
		};

		return json(response, { status: 200 });
	} catch (error) {
		const { status, body } = handleError(error, 'Error deleting participation');

		const response: ApiResponse<ParticipationsWithUsers> = {
			success: false,
			error: body
		};
		return json(response, { status });
	}
};
