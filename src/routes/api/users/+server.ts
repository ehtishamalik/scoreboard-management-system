// src/routes/api/user/[id]/+server.ts

import { handleError } from '$lib/server/error';
import { user } from '$lib/server/db/schema';
import { and, eq } from 'drizzle-orm';
import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { nanoid } from '$lib/server/helpers/nanoid';

import type { UserInsertModel, UserSelectModel } from '$lib/server/db/types';
import type { RequestHandler } from './$types';
import type { ApiResponse } from '$lib/types';

/**
 * Handles GET requests for users.
 * Example: /api/users
 */
export const GET: RequestHandler = async ({ url }) => {
	try {
		const userEmail = url.searchParams.get('email');
		const isActive = url.searchParams.get('isActive');

		const whereConditions = [];

		if (userEmail !== null) {
			whereConditions.push(eq(user.email, userEmail));
		}

		if (isActive !== null) {
			whereConditions.push(eq(user.isActive, isActive === 'true'));
		}

		const result = await db
			.select()
			.from(user)
			.where(and(...whereConditions));

		const response: ApiResponse<UserSelectModel[]> = {
			success: true,
			data: result
		};
		return json(response, { status: 200 });
	} catch (error) {
		console.error('Error getting user:', error);
		const { status, body } = handleError(error, 'Error getting user information');
		const response: ApiResponse<UserSelectModel[]> = {
			success: false,
			error: body
		};
		return json(response, { status });
	}
};

/**
 * Handles POST requests for a single user.
 * Example: /api/users
 */
export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();

		const userToAdd: UserInsertModel = {
			id: nanoid(),
			name: body.name,
			email: body.email
		};

		const result = await db.insert(user).values(userToAdd).returning();

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
