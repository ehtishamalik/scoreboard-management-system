// src/routes/api/tournaments/+server.ts

import { json } from '@sveltejs/kit';
import { and, desc, eq } from 'drizzle-orm';
import { tournament } from '$lib/server/db/schema';
import { db } from '$lib/server/db';
import { zodTournamentSchema, handleSchema } from '$lib/validation';
import { handleError, HttpError } from '$lib/server/error';
import { slugify } from '$lib/utils';

import type { RequestHandler } from './$types';
import type { ApiResponse } from '$lib/types';
import type { TournamentSelectModel } from '$lib/server/db/types';

/**
 * Handles GET requests to /api/tournaments
 * Supports filtering by isActive and isFinalized query parameters.
 * Example: /api/tournaments?isActive=true&isFinalized=false
 */
export const GET: RequestHandler = async ({ url }) => {
	try {
		const isActive = url.searchParams.get('isActive');
		const isFinalized = url.searchParams.get('isFinalized');

		const whereConditions = [];
		if (isActive !== null) {
			whereConditions.push(eq(tournament.isActive, isActive === 'true'));
		}
		if (isFinalized !== null) {
			whereConditions.push(eq(tournament.isFinalized, isFinalized === 'true'));
		}

		const allTournaments = await db
			.select()
			.from(tournament)
			.where(and(...whereConditions))
			.orderBy(desc(tournament.createdAt));

		const response: ApiResponse<TournamentSelectModel[]> = {
			success: true,
			data: allTournaments
		};

		return json(response, { status: 200 });
	} catch (error) {
		const { status, body } = handleError(error, 'Error getting tournaments');

		const response: ApiResponse<TournamentSelectModel[]> = {
			success: false,
			error: body
		};
		return json(response, { status });
	}
};

/**
 * Handles POST requests to /api/tournaments
 * Creates a new tournament record.
 */
export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();

		const { success, data, errors } = handleSchema(zodTournamentSchema, body);

		if (!success || !data) {
			throw new HttpError(400, `${errors.join(', ')}.`, 'Invalid tournament data');
		}

		let baseSlug = slugify(data.name);
		let slug = baseSlug;
		let counter = 1;
		const maxAttempts = 3;

		for (let attempt = 0; attempt < maxAttempts; attempt++) {
			const exists = await db.query.tournament.findFirst({
				where: (t, { eq }) => eq(t.slug, slug)
			});

			if (!exists) {
				break; // found unique slug
			}

			// only update slug if we still have retries left
			if (attempt < maxAttempts - 1) {
				slug = `${baseSlug}-${counter++}`;
			} else {
				throw new HttpError(
					409,
					`Failed to generate unique slug after ${maxAttempts} attempts. Please try again.`,
					'Slug generation failed'
				);
			}
		}

		const newTournament = await db
			.insert(tournament)
			.values({
				name: data.name,
				startDate: data.startDate ?? undefined,
				endDate: data.endDate ?? undefined,
				isActive: data.isActive ?? true,
				isFinalized: data.isFinalized ?? false,
				slug: slug
			})
			.returning();

		const response: ApiResponse<TournamentSelectModel> = {
			success: true,
			data: newTournament[0]
		};

		return json(response, { status: 201 });
	} catch (error) {
		const { status, body } = handleError(error, 'Error creating tournament');

		const response: ApiResponse<TournamentSelectModel[]> = {
			success: false,
			error: body
		};
		return json(response, { status });
	}
};
