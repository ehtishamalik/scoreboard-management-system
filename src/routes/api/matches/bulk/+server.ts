// src/routes/api/matches/bulk/+server.ts

import { handleError, HttpError } from '$lib/server/error';
import { json, type RequestHandler } from '@sveltejs/kit';
import { match, teams } from '$lib/server/db/schema';
import { db, dbWs } from '$lib/server/db';
import { eq } from 'drizzle-orm';

import type { MatchInsertModel, MatchSelectModel, TeamsSelectModel } from '$lib/server/db/types';
import type { ApiResponse } from '$lib/types';
import { assignMatchesToDates, generateRoundRobinSchedule } from '$lib/server/helpers/match';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { tournamentId, startDate, matchesPerDay } = body;

		if (!tournamentId || !startDate || !matchesPerDay) {
			throw new HttpError(
				400,
				'tournamentId, startDate, and matchesPerDay are required.',
				'Missing parameters'
			);
		}

		// Convert matchesPerDay object to Map
		const matchesPerDayMap = new Map<number, number>(
			Object.entries(matchesPerDay).map(([k, v]) => [Number(k), Number(v)])
		);

		// 1. get teams
		const allTeams: TeamsSelectModel[] = await db
			.select()
			.from(teams)
			.where(eq(teams.tournamentId, tournamentId));

		if (allTeams.length < 2) {
			throw new HttpError(400, 'At least 2 teams required to generate matches.', 'Missing teams');
		}

		// 2. generate schedule (round robin)
		const rounds = generateRoundRobinSchedule([...allTeams]);

		// 3. assign dates
		const scheduledMatches = assignMatchesToDates(rounds, startDate, matchesPerDayMap);

		const newMatches = await dbWs.transaction(async (tx) => {
			// 1. delete existing matches for this tournament
			await tx.delete(match).where(eq(match.tournamentId, tournamentId));

			// 4. insert new matches into DB
			return await tx
				.insert(match)
				.values(scheduledMatches.map((m) => ({ ...m, tournamentId })))
				.returning();
		});

		const response: ApiResponse<MatchSelectModel[]> = {
			success: true,
			data: newMatches
		};
		return json(response, { status: 201 });
	} catch (error) {
		const { status, body } = handleError(error, 'Error creating bulk matches');
		const response: ApiResponse<MatchSelectModel[]> = {
			success: false,
			error: body
		};
		return json(response, { status });
	}
};

export const PUT: RequestHandler = async ({ request }) => {
	try {
		const body: MatchInsertModel[] = await request.json();

		await dbWs.transaction(async (tx) => {
			for (const matchData of body) {
				await tx
					.update(match)
					.set({
						team1Id: matchData.team1Id,
						team2Id: matchData.team2Id,
						team1Points: matchData.team1Points || 0,
						team2Points: matchData.team2Points || 0,
						winnerId: matchData.winnerId || null,
						playDate: matchData.playDate
					})
					.where(eq(match.id, matchData.id!));
			}
		});

		const response: ApiResponse<null> = {
			success: true,
			data: null
		};
		return json(response, { status: 201 });
	} catch (error) {
		const { status, body } = handleError(error, 'Error creating bulk matches');
		const response: ApiResponse<MatchSelectModel[]> = {
			success: false,
			error: body
		};
		return json(response, { status });
	}
};
