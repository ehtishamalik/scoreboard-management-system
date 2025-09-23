// src/routes/api/matches/[id]/+server.ts

import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { match } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { zodMatchSchema, handleSchema } from '$lib/validation';
import { handleError, HttpError } from '$lib/server/error';

import type { RequestHandler } from './$types';
import type { ApiResponse } from '$lib/types';
import type { MatchSelectModel, MatchWithDetails } from '$lib/server/db/types';

/**
 * Handles GET requests for a single match by ID.
 * Example: /api/matches/abcdefg12345
 */
export const GET: RequestHandler = async ({ params }) => {
	try {
		const matches = await db.query.match.findMany({
			where: (_, { eq }) => eq(match.id, params.id),
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

		if (matches.length === 0) {
			throw new HttpError(404, 'No match found with the given ID.', 'Match not found');
		}

		const response: ApiResponse<MatchWithDetails> = {
			success: true,
			data: matches[0]
		};
		return json(response, { status: 200 });
	} catch (error) {
		const { status, body } = handleError(error, 'Error getting match with ID');
		const response: ApiResponse<MatchWithDetails> = {
			success: false,
			error: body
		};
		return json(response, { status });
	}
};

/**
 * Handles PUT requests to update a match by ID.
 * All fields are optional.
 * Example: /api/matches/abcdefg12345
 */
export const PUT: RequestHandler = async ({ params, request }) => {
	try {
		const body = await request.json();

		const { success, data, errors } = handleSchema(zodMatchSchema, body);
		if (!success || !data) {
			throw new HttpError(400, `${errors.join(', ')}.`, 'Invalid match data');
		}

		const updatedMatch = await db
			.update(match)
			.set(data)
			.where(eq(match.id, params.id))
			.returning();

		if (updatedMatch.length === 0) {
			throw new HttpError(404, 'No match found with the given ID.', 'Match not found');
		}

		const response: ApiResponse<MatchSelectModel> = {
			success: true,
			data: updatedMatch[0]
		};
		return json(response, { status: 200 });
	} catch (error) {
		const { status, body } = handleError(error, 'Error updating match with ID');
		const response: ApiResponse<MatchWithDetails> = {
			success: false,
			error: body
		};
		return json(response, { status });
	}
};

/**
 * Handles DELETE requests to delete a match by ID.
 * Example: /api/matches/abcdefg12345
 */
export const DELETE: RequestHandler = async ({ params }) => {
	try {
		const deletedMatch = await db.delete(match).where(eq(match.id, params.id)).returning();

		if (deletedMatch.length === 0) {
			throw new HttpError(404, 'No match found with the given ID.', 'Match not found');
		}

		const response: ApiResponse<MatchSelectModel> = {
			success: true,
			data: deletedMatch[0]
		};
		return json(response, { status: 200 });
	} catch (error) {
		const { status, body } = handleError(error, 'Error deleting match');
		const response: ApiResponse<MatchWithDetails> = {
			success: false,
			error: body
		};
		return json(response, { status });
	}
};
