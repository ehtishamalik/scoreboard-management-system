// src/routes/api/users/me/stats/+server.ts

import { json } from '@sveltejs/kit';
import { eq, sql } from 'drizzle-orm';
import { dbReplica } from '$lib/server/db';
import { participation, teams, match } from '$lib/server/db/schema';
import { handleError, HttpError } from '$lib/server/error';
import { auth } from '$lib/server/auth';

import type { RequestHandler } from './$types';
import type { ApiResponse, UserPerformanceStats } from '$lib/types';

export const GET: RequestHandler = async ({ request }) => {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session) {
      throw new HttpError(
        401,
        'Unauthorized',
        'You must be logged in to access performance stats.'
      );
    }

    const userId = session.user.id;

    // 1. Get all participations for the user
    const userParticipations = await dbReplica
      .select({ id: participation.id })
      .from(participation)
      .where(eq(participation.userId, userId));

    if (userParticipations.length === 0) {
      return json({
        success: true,
        data: {
          totalMatches: 0,
          wins: 0,
          losses: 0,
          winRate: 0,
          totalPointsFor: 0,
          totalPointsAgainst: 0,
          avgPointsPerMatch: 0,
          pointsHistory: [],
          globalAvgWinRate: 0,
          globalAvgPoints: 0
        }
      } as ApiResponse<UserPerformanceStats>);
    }

    const participationIds = userParticipations.map((p) => p.id);

    // 2. Get all teams where the user participated
    const userTeams = await dbReplica
      .select({ id: teams.id })
      .from(teams)
      .where(
        sql`${teams.participationPlayerOne} IN ${participationIds} OR ${teams.participationPlayerTwo} IN ${participationIds}`
      );

    if (userTeams.length === 0) {
      return json({
        success: true,
        data: {
          totalMatches: 0,
          wins: 0,
          losses: 0,
          winRate: 0,
          totalPointsFor: 0,
          totalPointsAgainst: 0,
          avgPointsPerMatch: 0,
          pointsHistory: [],
          globalAvgWinRate: 0,
          globalAvgPoints: 0
        }
      } as ApiResponse<UserPerformanceStats>);
    }

    const teamIds = userTeams.map((t) => t.id);

    // 3. Get all matches for these teams
    const userMatches = await dbReplica
      .select()
      .from(match)
      .where(sql`${match.team1Id} IN ${teamIds} OR ${match.team2Id} IN ${teamIds}`)
      .orderBy(match.playDate);

    // 4. Calculate stats
    let wins = 0;
    let totalPointsFor = 0;
    let totalPointsAgainst = 0;
    const pointsHistory: { date: string; points: number }[] = [];

    for (const m of userMatches) {
      const isTeam1 = teamIds.includes(m.team1Id);
      const pointsFor = isTeam1 ? m.team1Points : m.team2Points;
      const pointsAgainst = isTeam1 ? m.team2Points : m.team1Points;

      totalPointsFor += pointsFor;
      totalPointsAgainst += pointsAgainst;
      pointsHistory.push({ date: m.playDate, points: pointsFor });

      if (m.winnerId && teamIds.includes(m.winnerId)) {
        wins++;
      }
    }

    const totalMatches = userMatches.length;
    const winRate = totalMatches > 0 ? (wins / totalMatches) * 100 : 0;
    const avgPointsPerMatch = totalMatches > 0 ? totalPointsFor / totalMatches : 0;

    // 5. Global Averages
    const allMatchesCount = await dbReplica.select({ count: sql`count(*)` }).from(match);
    const totalSystemMatches = Number(allMatchesCount[0].count);

    const allWinsCount = await dbReplica
      .select({ count: sql`count(*)` })
      .from(match)
      .where(sql`${match.winnerId} IS NOT NULL`);
    const totalSystemWins = Number(allWinsCount[0].count);

    const globalAvgWinRate =
      totalSystemMatches > 0 ? (totalSystemWins / (totalSystemMatches * 2)) * 100 : 0; // Each match has 2 teams, only 1 wins (usually)

    const totalSystemPoints = await dbReplica
      .select({ sum: sql`sum(${match.team1Points} + ${match.team2Points})` })
      .from(match);
    const globalAvgPoints =
      totalSystemMatches > 0 ? Number(totalSystemPoints[0].sum) / (totalSystemMatches * 2) : 0;

    const stats: UserPerformanceStats = {
      totalMatches,
      wins,
      losses: totalMatches - wins,
      winRate,
      totalPointsFor,
      totalPointsAgainst,
      avgPointsPerMatch,
      pointsHistory,
      globalAvgWinRate,
      globalAvgPoints
    };

    return json({ success: true, data: stats } as ApiResponse<UserPerformanceStats>);
  } catch (error) {
    const { status, body } = handleError(error, 'Error fetching performance stats');
    return json({ success: false, error: body } as ApiResponse<null>, { status });
  }
};
