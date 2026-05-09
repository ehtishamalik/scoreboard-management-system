// /src/routes/api/push/notify/+server.ts

import webpush from 'web-push';
import { db } from '$lib/server/db';
import { pushSubscriptions } from '$lib/server/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { env } from '$env/dynamic/private';
import { env as envPublic } from '$env/dynamic/public';
import { json } from '@sveltejs/kit';
import { handleError } from '$lib/server/error';

import type { ApiResponse } from '$lib/types';

webpush.setVapidDetails(
  `mailto:${env.VAPID_EMAIL}`,
  envPublic.PUBLIC_VAPID_KEY!,
  env.PRIVATE_VAPID_KEY
);

export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Active tournaments
    const activeTournaments = await db.query.tournament.findMany({
      where: (t, { eq }) => eq(t.isActive, true)
    });

    if (activeTournaments.length === 0) {
      const response: ApiResponse<string> = {
        success: true,
        data: 'No active tournaments'
      };
      return json(response, { status: 200 });
    }

    // Matches for today
    const matchesToday = await db.query.match.findMany({
      with: {
        tournament: true,
        team1: {
          with: { participationPlayerOne: true, participationPlayerTwo: true }
        },
        team2: {
          with: { participationPlayerOne: true, participationPlayerTwo: true }
        }
      },
      where: (m, { eq }) => eq(m.playDate, today)
    });

    if (matchesToday.length === 0) {
      const response: ApiResponse<string> = {
        success: true,
        data: 'No matches today'
      };
      return json(response, { status: 200 });
    }

    for (const match of matchesToday) {
      const playerIds = [
        match.team1.participationPlayerOne.userId,
        match.team1.participationPlayerTwo.userId,
        match.team2.participationPlayerOne.userId,
        match.team2.participationPlayerTwo.userId
      ].filter(Boolean); // remove nulls just in case

      // Subscriptions
      const subs = await db.query.pushSubscriptions.findMany({
        where: (s, { and }) => and(eq(s.isEnabled, true), inArray(s.userId, playerIds))
      });

      if (subs.length === 0) continue;

      const payload = JSON.stringify({
        title: `You have a match today in ${match.tournament.name}`,
        body: `${match.team1.name} vs ${match.team2.name} — happening today`
      });

      for (const sub of subs) {
        try {
          console.log(`Sending notification to ${sub.userId} | payload: ${payload}`);

          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth }
            },
            payload
          );
        } catch (err: any) {
          if (err.statusCode === 410 || err.statusCode === 404) {
            // Subscription expired → delete
            await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, sub.id));
            console.log('Removed invalid subscription of user: ', sub.userId);
          } else {
            console.error('Error sending notification to', sub.id, sub.userId, err);
          }
        }
      }
    }

    return json(
      {
        success: true,
        data: 'Notifications sent'
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
}
