import { json } from '@sveltejs/kit';
import { db, dbReplica } from '$lib/server/db';
import { matchSeries } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { zodMatchSeriesSchema, handleSchema } from '$lib/validation';
import { handleError, HttpError } from '$lib/server/error';

import type { RequestHandler } from './$types';
import type { ApiResponse } from '$lib/types';
import type { MatchSeriesSelectModel, MatchSeriesWithDetails } from '$lib/server/db/types';

// 🧭 GET /api/match-series/:id
export const GET: RequestHandler = async ({ params }) => {
  try {
    const series = await dbReplica.query.matchSeries.findMany({
      where: (_, { eq }) => eq(matchSeries.id, params.id),
      with: {
        tournament: true,
        team1: true,
        team2: true,
        winner: true
      }
    });

    if (series.length === 0) {
      throw new HttpError(404, 'No series found with the given ID.', 'Match series not found');
    }

    const response: ApiResponse<MatchSeriesWithDetails> = {
      success: true,
      data: series[0]
    };
    return json(response, { status: 200 });
  } catch (error) {
    const { status, body } = handleError(error, 'Error fetching match series by ID');
    const response: ApiResponse<MatchSeriesWithDetails> = {
      success: false,
      error: body
    };
    return json(response, { status });
  }
};

// 🧭 PUT /api/match-series/:id
export const PUT: RequestHandler = async ({ params, request }) => {
  try {
    const body = await request.json();

    const { success, data, errors } = handleSchema(zodMatchSeriesSchema, body);
    if (!success || !data) {
      throw new HttpError(400, `${errors.join(', ')}.`, 'Invalid match series data');
    }

    const updated = await db
      .update(matchSeries)
      .set(data)
      .where(eq(matchSeries.id, params.id))
      .returning();

    if (updated.length === 0) {
      throw new HttpError(404, 'No series found with the given ID.', 'Match series not found');
    }

    const response: ApiResponse<MatchSeriesSelectModel> = {
      success: true,
      data: updated[0]
    };
    return json(response, { status: 200 });
  } catch (error) {
    const { status, body } = handleError(error, 'Error updating match series');
    const response: ApiResponse<MatchSeriesSelectModel> = {
      success: false,
      error: body
    };
    return json(response, { status });
  }
};

// 🧭 DELETE /api/match-series/:id
export const DELETE: RequestHandler = async ({ params }) => {
  try {
    const deleted = await db.delete(matchSeries).where(eq(matchSeries.id, params.id)).returning();

    if (deleted.length === 0) {
      throw new HttpError(404, 'No series found with the given ID.', 'Match series not found');
    }

    const response: ApiResponse<MatchSeriesSelectModel> = {
      success: true,
      data: deleted[0]
    };
    return json(response, { status: 200 });
  } catch (error) {
    const { status, body } = handleError(error, 'Error deleting match series');
    const response: ApiResponse<MatchSeriesSelectModel> = {
      success: false,
      error: body
    };
    return json(response, { status });
  }
};
