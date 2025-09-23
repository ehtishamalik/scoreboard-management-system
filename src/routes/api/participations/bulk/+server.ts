// src/routes/api/participations/bulk/+server.ts

import { handleSchemaBulk, zodBulkParticipationSchema } from '$lib/validation';
import { json, type RequestHandler } from '@sveltejs/kit';
import { participation } from '$lib/server/db/schema';
import { handleError } from '$lib/server/error';
import { HttpError } from '$lib/server/error';
import { db } from '$lib/server/db';

import type { ParticipationSelectModel } from '$lib/server/db/types';
import type { ApiResponse } from '$lib/types';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();

		const { success, data, errors } = handleSchemaBulk(zodBulkParticipationSchema, body);

		if (!success || !data) {
			throw new HttpError(400, `${errors.join(', ')}.`, 'Invalid bulk participation data');
		}

		const newParticipations = await db.insert(participation).values(data).returning();

		const response: ApiResponse<ParticipationSelectModel[]> = {
			success: true,
			data: newParticipations
		};
		return json(response, { status: 201 });
	} catch (error) {
		const { status, body } = handleError(error, 'Error creating bulk participations');
		const response: ApiResponse<ParticipationSelectModel[]> = {
			success: false,
			error: body
		};
		return json(response, { status });
	}
};
