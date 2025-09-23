// src/routes/api/matches/+server.ts

import { zodMatchSchema, handleSchema } from '$lib/validation';
import { handleError, HttpError } from '$lib/server/error';
import { match } from '$lib/server/db/schema';
import { json } from '@sveltejs/kit';
import { inArray } from 'drizzle-orm';
import { db } from '$lib/server/db';

import type { MatchSelectModel, MatchWithDetails } from '$lib/server/db/types';
import type { RequestHandler } from './$types';
import type { ApiResponse, MatchType } from '$lib/types';

/**
 * Handles GET requests to /api/matches
 * Supports filtering by tournamentId query parameter.
 * Example: /api/matches?tournamentId=12345
 */
export const GET: RequestHandler = async ({ url }) => {
	try {
		const tournamentId = url.searchParams.get('tournamentId');
		const teamId = url.searchParams.get('teamId');

		// Allow multiple match types via comma-separated or repeated query params
		const typeParams = url.searchParams.getAll('type'); // handles ?type=SEMIFINAL&type=FINAL
		const typesRaw = typeParams.length > 0 ? typeParams : ['ROUNDROBIN'];

		// Support comma-separated string too (?type=SEMIFINAL,FINAL)
		const matchTypes: MatchType[] = typesRaw
			.flatMap((t) => t.split(','))
			.map((t) => t.trim().toUpperCase())
			.filter(Boolean) as MatchType[];

		const validTypes: MatchType[] = ['ROUNDROBIN', 'SEMIFINAL', 'FINAL'] as const;
		const invalidTypes = matchTypes.filter((t) => !validTypes.includes(t as any));

		if (invalidTypes.length > 0) {
			throw new HttpError(
				400,
				`Invalid match types: ${invalidTypes.join(', ')} - only ${validTypes.join(', ')} are allowed.`,
				'Invalid parameter'
			);
		}

		const allMatches = await db.query.match.findMany({
			where: (m, { and, eq, or }) =>
				and(
					tournamentId ? eq(m.tournamentId, tournamentId) : undefined,
					teamId ? or(eq(m.team1Id, teamId), eq(m.team2Id, teamId)) : undefined,
					matchTypes.length > 0 ? inArray(m.type, matchTypes) : undefined
				),
			orderBy: (m, { asc }) => [asc(m.playDate), asc(m.id)],
			with: {
				tournament: true,
				team1: {
					with: {
						participationPlayerOne: {
							with: { user: true, tournament: true }
						},
						participationPlayerTwo: {
							with: { user: true, tournament: true }
						},
						tournament: true
					}
				},
				team2: {
					with: {
						participationPlayerOne: {
							with: { user: true, tournament: true }
						},
						participationPlayerTwo: {
							with: { user: true, tournament: true }
						},
						tournament: true
					}
				},
				winner: {
					with: {
						participationPlayerOne: {
							with: { user: true, tournament: true }
						},
						participationPlayerTwo: {
							with: { user: true, tournament: true }
						},
						tournament: true
					}
				}
			}
		});

		const response: ApiResponse<MatchWithDetails[]> = {
			success: true,
			data: allMatches
		};
		return json(response, { status: 200 });
	} catch (error) {
		const { status, body } = handleError(error, 'Error getting matches');

		const response: ApiResponse<MatchWithDetails[]> = {
			success: false,
			error: body
		};
		return json(response, { status });
	}
};

/**
 * Handles POST requests to /api/matches
 * Creates a new match record.
 */
export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();

		const { success, data, errors } = handleSchema(zodMatchSchema, body);
		if (!success || !data) {
			throw new HttpError(400, `${errors.join(', ')}.`, 'Invalid match data');
		}

		const newMatch = await db.insert(match).values(data).returning();

		const response: ApiResponse<MatchSelectModel> = {
			success: true,
			data: newMatch[0]
		};
		return json(response, { status: 201 });
	} catch (error) {
		const { status, body } = handleError(error, 'Error creating matches');

		const response: ApiResponse<MatchSelectModel[]> = {
			success: false,
			error: body
		};
		return json(response, { status });
	}
};
