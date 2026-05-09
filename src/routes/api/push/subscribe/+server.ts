// /src/routes/api/push/subscribe/+server.ts

import { db } from '$lib/server/db';
import { pushSubscriptions } from '$lib/server/db/schema';
import { nanoid } from 'nanoid';
import { json } from '@sveltejs/kit';
import { handleError } from '$lib/server/error';
import { HttpError } from '$lib/server/error';

import type { ApiResponse } from '$lib/types';

export async function POST({ request }) {
  try {
    const body = await request.json();

    if (!body.userId) {
      throw new HttpError(401, 'You are not authorized to perform this action.', 'Unauthorized');
    }

    const { endpoint, keys } = body;
    const { p256dh, auth } = keys;

    // Check if already exists
    const existing = await db.query.pushSubscriptions.findFirst({
      where: (sub, { eq }) => eq(sub.endpoint, endpoint)
    });

    if (!existing) {
      await db.insert(pushSubscriptions).values({
        id: nanoid(),
        userId: body.userId,
        endpoint,
        p256dh,
        auth
      });
    }

    return json({ success: true });
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    const { status, body } = handleError(error, 'Error subscribing to push notifications');
    const response: ApiResponse<null> = {
      success: false,
      error: body
    };
    return json(response, { status });
  }
}
