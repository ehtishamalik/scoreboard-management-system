// src/routes/api/teams/+server.ts

import { handleSchema, zodTeamSchema } from '$lib/validation';
import { handleError, HttpError } from '$lib/server/error';
import { teams } from '$lib/server/db/schema';
import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';

import type { TeamsSelectModel, TeamWithPlayers } from '$lib/server/db/types';
import type { RequestHandler } from './$types';
import type { ApiResponse } from '$lib/types';

/**
 * Handles GET requests to /api/teams
 * Supports filtering by tournamentId query parameter.
 * Example: /api/teams?tournamentId=12345
 */
export const GET: RequestHandler = async ({ url }) => {
	try {
		const tournamentId = url.searchParams.get('tournamentId');

		const whereConditions = [];
		if (tournamentId) {
			whereConditions.push(eq(teams.tournamentId, tournamentId));
		}

		const allTeams = await db.query.teams.findMany({
			where: (t, { eq }) => (tournamentId ? eq(t.tournamentId, tournamentId) : undefined),
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

		const response: ApiResponse<TeamWithPlayers[]> = {
			success: true,
			data: allTeams
		};
		return json(response, { status: 200 });
	} catch (error) {
		const { status, body } = handleError(error, 'Error getting teams');
		const response: ApiResponse<TeamWithPlayers[]> = {
			success: false,
			error: body
		};
		return json(response, { status });
	}
};

/**
 * Handles POST requests to /api/teams
 * Creates a new team record.
 */
export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();

		const { success, data, errors } = handleSchema(zodTeamSchema, body);

		if (!success || !data) {
			throw new HttpError(400, `${errors.join(', ')}.`, 'Invalid team data');
		}

		const newTeam = await db.insert(teams).values(data).returning();

		const response: ApiResponse<TeamsSelectModel> = {
			success: true,
			data: newTeam[0]
		};
		return json(response, { status: 201 });
	} catch (error) {
		console.error('Error creating team:', error);
		const { status, body } = handleError(error, 'Error creating team');
		const response: ApiResponse<TeamsSelectModel> = {
			success: false,
			error: body
		};
		return json(response, { status });
	}
};
