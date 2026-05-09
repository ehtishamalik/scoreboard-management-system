// /src/routes/api/push/notify/+server.ts

import webpush from 'web-push';
import { db } from '$lib/server/db';
import { pushSubscriptions } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { env } from '$env/dynamic/private';
import { env as envPublic } from '$env/dynamic/public';
import { json } from '@sveltejs/kit';
import { handleError } from '$lib/server/error';

import type { ApiResponse } from '$lib/types';
import type { RequestHandler } from './$types';
import { HttpError } from '$lib/server/error';

webpush.setVapidDetails(
  'mailto:ehtisham@lycusinc.com',
  envPublic.PUBLIC_VAPID_KEY!,
  env.PRIVATE_VAPID_KEY
);

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const { userIds, title, message } = body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      throw new HttpError(400, 'userIds must be a non-empty array', 'Invalid data');
    }

    if (!title || !message) {
      throw new HttpError(400, 'title and message are required', 'Invalid data');
    }

    const subscriptions = await db.query.pushSubscriptions.findMany({
      where: (ps, { inArray }) => inArray(ps.userId, userIds)
    });

    const notificationPayload = JSON.stringify({
      title,
      body: message
    });

    const sendNotifications = subscriptions.map(async (sub) => {
      console.log(`Sending notification to ${sub.userId} | payload: ${notificationPayload}`);
      return webpush
        .sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth }
          },
          notificationPayload
        )
        .catch((err) => {
          if (err.statusCode === 410 || err.statusCode === 404) {
            // Remove subscription from database
            return db
              .delete(pushSubscriptions)
              .where(eq(pushSubscriptions.id, sub.id))
              .then(() => {
                console.log('Removed invalid subscription of user: ', sub.userId);
              });
          } else {
            console.error('Error sending notification to', sub.id, sub.userId, err);
          }
        });
    });

    await Promise.all(sendNotifications);
    return json(
      {
        success: true,
        data: 'Notification sent'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error creating team:', error);
    const { status, body } = handleError(error, 'Error creating team');
    const response: ApiResponse<null> = {
      success: false,
      error: body
    };
    return json(response, { status });
  }
};
