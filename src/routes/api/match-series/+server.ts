import { json } from '@sveltejs/kit';
import { db, dbReplica } from '$lib/server/db';
import { matchSeries } from '$lib/server/db/schema';
import { handleError, HttpError } from '$lib/server/error';
import { handleSchema, zodMatchSeriesSchema } from '$lib/validation';

import type { RequestHandler } from './$types';
import type { ApiResponse } from '$lib/types';
import type { MatchSeriesSelectModel, MatchSeriesWithDetails } from '$lib/server/db/types';

// 🧭 GET /api/match-series
export const GET: RequestHandler = async ({ url }) => {
  try {
    const tournamentId = url.searchParams.get('tournamentId');

    const seriesList = await dbReplica.query.matchSeries.findMany({
      where: (m, { and, or, eq }) =>
        and(tournamentId ? eq(m.tournamentId, tournamentId) : undefined),
      orderBy: (m, { asc }) => [asc(m.playedDate), asc(m.id)],
      with: {
        tournament: true,
        team1: true,
        team2: true,
        winner: true
      }
    });

    const response: ApiResponse<MatchSeriesWithDetails[]> = {
      success: true,
      data: seriesList
    };
    return json(response, { status: 200 });
  } catch (error) {
    const { status, body } = handleError(error, 'Error fetching match series');
    const response: ApiResponse<MatchSeriesWithDetails[]> = {
      success: false,
      error: body
    };
    return json(response, { status });
  }
};

// 🧭 POST /api/match-series
export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();

    const { success, data, errors } = handleSchema(zodMatchSeriesSchema, body);
    if (!success || !data) {
      throw new HttpError(400, `${errors.join(', ')}.`, 'Invalid match series data');
    }

    const createdSeries = await db.insert(matchSeries).values(data).returning();

    const response: ApiResponse<MatchSeriesSelectModel> = {
      success: true,
      data: createdSeries[0]
    };
    return json(response, { status: 201 });
  } catch (error) {
    const { status, body } = handleError(error, 'Error creating match series');
    const response: ApiResponse<MatchSeriesSelectModel> = {
      success: false,
      error: body
    };
    return json(response, { status });
  }
};
