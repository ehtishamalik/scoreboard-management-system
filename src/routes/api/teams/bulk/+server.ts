// src/routes/api/teams/bulk/+server.ts

import { handleSchemaBulk, zodBulkTeamsSchema } from '$lib/validation';
import { handleError, HttpError } from '$lib/server/error';
import { json, type RequestHandler } from '@sveltejs/kit';
import { teams } from '$lib/server/db/schema';
import { dbWs } from '$lib/server/db';
import { eq } from 'drizzle-orm';

import type { TeamsSelectModel } from '$lib/server/db/types';
import type { ApiResponse } from '$lib/types';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { success, data, errors } = handleSchemaBulk(zodBulkTeamsSchema, body);

		if (!success || !data) {
			throw new HttpError(400, `${errors.join(', ')}.`, 'Invalid bulk team data');
		}

		const tournamentId = data[0].tournamentId;

		const newTeams = await dbWs.transaction(async (tx) => {
			// 1. delete existing teams for this tournament
			await tx.delete(teams).where(eq(teams.tournamentId, tournamentId));

			// 2. insert new batch of teams
			return await tx.insert(teams).values(data).returning();
		});

		const response: ApiResponse<TeamsSelectModel[]> = {
			success: true,
			data: newTeams
		};
		return json(response, { status: 201 });
	} catch (error) {
		const { status, body } = handleError(error, 'Error creating bulk teams');
		const response: ApiResponse<TeamsSelectModel[]> = {
			success: false,
			error: body
		};
		return json(response, { status });
	}
};
