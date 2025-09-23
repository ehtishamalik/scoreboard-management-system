// src/routes/api/teams/[id]/+server.ts

import { zodTeamSchema, handleSchema } from '$lib/validation';
import { handleError, HttpError } from '$lib/server/error';
import { teams } from '$lib/server/db/schema';
import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';

import type { TeamsSelectModel } from '$lib/server/db/types';
import type { TeamWithPlayers } from '$lib/server/db/types';
import type { RequestHandler } from './$types';
import type { ApiResponse } from '$lib/types';

/**
 * Handles GET requests for a single team by ID.
 * Example: /api/teams/abcdefg12345
 */
export const GET: RequestHandler = async ({ params }) => {
	try {
		const result = await db.query.teams.findMany({
			where: (_, { eq }) => eq(teams.id, params.id),
			with: {
				participationPlayerOne: {
					with: {
						user: true,
						tournament: true
					}
				},
				participationPlayerTwo: {
					with: {
						user: true,
						tournament: true
					}
				},
				tournament: true
			}
		});

		if (result.length === 0) {
			throw new HttpError(404, 'No team with the given ID exists.', 'Team not found');
		}

		const response: ApiResponse<TeamWithPlayers> = {
			success: true,
			data: result[0]
		};
		return json(response, { status: 200 });
	} catch (error) {
		const { status, body } = handleError(error, 'Error getting team with ID');
		const response: ApiResponse<TeamWithPlayers> = {
			success: false,
			error: body
		};
		return json(response, { status });
	}
};

/**
 * Handles PUT requests to update a team by ID.
 * All fields are optional.
 * Example: /api/teams/abcdefg12345
 */
export const PUT: RequestHandler = async ({ params, request }) => {
	try {
		const body = await request.json();

		const { success, data, errors } = handleSchema(zodTeamSchema, body);
		if (!success || !data) {
			throw new HttpError(400, `${errors.join(', ')}.`, 'Invalid team data');
		}

		const updatedTeam = await db.update(teams).set(data).where(eq(teams.id, params.id)).returning();

		if (updatedTeam.length === 0) {
			throw new HttpError(404, 'No team with the given ID exists.', 'Team not found');
		}

		const response: ApiResponse<TeamsSelectModel> = {
			success: true,
			data: updatedTeam[0]
		};
		return json(response, { status: 200 });
	} catch (error) {
		const { status, body } = handleError(error, 'Error updating team');
		const response: ApiResponse<TeamsSelectModel> = {
			success: false,
			error: body
		};
		return json(response, { status });
	}
};

/**
 * Handles DELETE requests to delete a team by ID.
 * Example: /api/teams/abcdefg12345
 */
export const DELETE: RequestHandler = async ({ params }) => {
	try {
		const deletedTeam = await db.delete(teams).where(eq(teams.id, params.id)).returning();

		if (deletedTeam.length === 0) {
			throw new HttpError(404, 'No team with the given ID exists.', 'Team not found');
		}

		const response: ApiResponse<TeamsSelectModel> = {
			success: true,
			data: deletedTeam[0]
		};
		return json(response, { status: 200 });
	} catch (error) {
		const { status, body } = handleError(error, 'Error deleting team');
		const response: ApiResponse<TeamsSelectModel> = {
			success: false,
			error: body
		};
		return json(response, { status });
	}
};
