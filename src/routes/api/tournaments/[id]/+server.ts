// src/routes/api/tournaments/[id]/+server.ts

import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { tournament } from '$lib/server/db/schema';
import { zodTournamentSchema, handleSchema } from '$lib/validation';
import { handleError, HttpError } from '$lib/server/error';

import type { RequestHandler } from './$types';
import type { TournamentSelectModel } from '$lib/server/db/types';
import type { ApiResponse } from '$lib/types';

/**
 * Handles GET requests for a single tournament by ID.
 * Example: /api/tournaments/clrvj8r7o000010m5p4n1m7x
 */
export const GET: RequestHandler = async ({ params }) => {
	try {
		const result = await db.select().from(tournament).where(eq(tournament.id, params.id));

		if (result.length === 0) {
			throw new HttpError(404, 'No tournament with the given ID.', 'Tournament not found');
		}

		const response: ApiResponse<TournamentSelectModel> = {
			success: true,
			data: result[0]
		};

		return json(response, { status: 200 });
	} catch (error) {
		const { status, body } = handleError(error, 'Error getting tournament with ID');

		const response: ApiResponse<TournamentSelectModel> = {
			success: false,
			error: body
		};
		return json(response, { status });
	}
};

/**
 * Handles PUT requests to update a tournament by ID.
 * Example: /api/tournaments/clrvj8r7o000010m5p4n1m7x
 */
export const PUT: RequestHandler = async ({ params, request }) => {
	try {
		const body = await request.json();

		const { success, data, errors } = handleSchema(zodTournamentSchema, body);

		if (!success || !data) {
			throw new HttpError(400, `${errors.join(', ')}.`, 'Invalid tournament data');
		}

		const updatedTournament = await db
			.update(tournament)
			.set({
				name: data.name,
				startDate: data.startDate,
				endDate: data.endDate,
				isActive: data.isActive,
				isFinalized: data.isFinalized,
				updatedAt: new Date()
			})
			.where(eq(tournament.id, params.id))
			.returning();

		if (updatedTournament.length === 0) {
			throw new HttpError(404, 'No tournament with the given ID.', 'Tournament not found');
		}

		const response: ApiResponse<TournamentSelectModel> = {
			success: true,
			data: updatedTournament[0]
		};

		return json(response);
	} catch (error) {
		const { status, body } = handleError(error, 'Error updating tournament');

		const response: ApiResponse<TournamentSelectModel> = {
			success: false,
			error: body
		};
		return json(response, { status });
	}
};

/**
 * Handles DELETE requests to delete a tournament by ID.
 * Example: /api/tournaments/clrvj8r7o000010m5p4n1m7x
 */
export const DELETE: RequestHandler = async ({ params }) => {
	try {
		const deletedTournament = await db
			.delete(tournament)
			.where(eq(tournament.id, params.id))
			.returning();

		if (deletedTournament.length === 0) {
			throw new HttpError(404, 'No tournament with the given ID.', 'Tournament not found');
		}

		const response: ApiResponse<TournamentSelectModel> = {
			success: true,
			data: deletedTournament[0]
		};

		return json(response, { status: 200 });
	} catch (error) {
		const { status, body } = handleError(error, 'Error deleting tournament');

		const response: ApiResponse<TournamentSelectModel> = {
			success: false,
			error: body
		};
		return json(response, { status });
	}
};
