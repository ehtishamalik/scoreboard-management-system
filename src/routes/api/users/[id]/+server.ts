// src/routes/api/user/[id]/+server.ts

import { handleError, HttpError } from '$lib/server/error';
import { user } from '$lib/server/db/schema';
import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';

import type { UserInsertModel, UserSelectModel } from '$lib/server/db/types';
import type { RequestHandler } from './$types';
import type { ApiResponse } from '$lib/types';

/**
 * Handles GET requests for a single match by ID.
 * Example: /api/users/abcdefg12345
 */
export const GET: RequestHandler = async ({ params }) => {
	try {
		const result = await db.select().from(user).where(eq(user.id, params.id));

		if (result.length === 0) {
			throw new HttpError(404, 'No user with the given ID exists.', 'User not found');
		}

		const response: ApiResponse<UserSelectModel> = {
			success: true,
			data: result[0]
		};
		return json(response, { status: 200 });
	} catch (error) {
		const { status, body } = handleError(error, 'Error getting user with ID');
		const response: ApiResponse<UserSelectModel> = {
			success: false,
			error: body
		};
		return json(response, { status });
	}
};

/**
 * Handles PATCH requests for a single match by ID.
 * Example: /api/users/abcdefg12345
 */
export const PATCH: RequestHandler = async ({ params, request }) => {
	try {
		const body: UserInsertModel = await request.json();

		const result = await db
			.update(user)
			.set({
				role: body.role,
				isActive: body.isActive
			})
			.where(eq(user.id, params.id))
			.returning();

		if (result.length === 0) {
			throw new HttpError(404, 'No user with the given ID exists.', 'User not found');
		}

		const response: ApiResponse<UserSelectModel> = {
			success: true,
			data: result[0]
		};
		return json(response, { status: 200 });
	} catch (error) {
		const { status, body } = handleError(error, 'Error updating user');
		const response: ApiResponse<UserSelectModel> = {
			success: false,
			error: body
		};
		return json(response, { status });
	}
};
