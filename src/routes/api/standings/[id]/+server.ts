// src/routes/api/standings/[id]/+server.ts

import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { match, teams } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { handleError } from '$lib/server/error';

import type { RequestHandler } from './$types';
import type { ApiResponse, TournamentStanding } from '$lib/types';
import type { MatchWithDetails } from '$lib/server/db/types';

/**
 * Handles GET requests for a single standing by Tournament ID.
 * Example: /api/standings/abcdefg12345
 */
export const GET: RequestHandler = async ({ params }) => {
	try {
		const tournamentId = params.id;

		// Get all teams for this tournament
		const allTeams = await db.select().from(teams).where(eq(teams.tournamentId, tournamentId));

		// Get all matches for this tournament
		const allMatches = await db.select().from(match).where(eq(match.tournamentId, tournamentId));

		// Build standings
		const standings = allTeams.map((team) => {
			let wins = 0;
			let losses = 0;
			let pf = 0; // points for
			let pa = 0; // points against

			for (const m of allMatches) {
				if (m.team1Id === team.id || m.team2Id === team.id) {
					const isTeam1 = m.team1Id === team.id;

					const scored = isTeam1 ? m.team1Points : m.team2Points;
					const conceded = isTeam1 ? m.team2Points : m.team1Points;

					pf += scored;
					pa += conceded;

					if (m.winnerId === team.id) {
						wins++;
					} else if (m.winnerId && m.winnerId !== team.id) {
						losses++;
					}
				}
			}

			const totalGames = wins + losses;
			const pct = totalGames > 0 ? wins / totalGames : 0;
			const pd = pf - pa;
			const pts = wins * 3;

			return {
				teamId: team.id,
				teamName: team.name,
				W: wins,
				L: losses,
				PCT: Number(pct.toFixed(3)),
				PF: pf,
				PA: pa,
				PD: pd,
				PTS: pts
			};
		});

		// Sort by: PTS desc, PD desc, PF desc, PA asc
		standings.sort((a, b) => {
			if (b.PTS !== a.PTS) return b.PTS - a.PTS;
			if (b.PD !== a.PD) return b.PD - a.PD;
			if (b.PF !== a.PF) return b.PF - a.PF;
			return a.PA - b.PA;
		});

		const response: ApiResponse<TournamentStanding[]> = {
			success: true,
			data: standings
		};

		return json(response, { status: 200 });
	} catch (error) {
		const { status, body } = handleError(error, 'Error getting standings');
		const response: ApiResponse<MatchWithDetails> = {
			success: false,
			error: body
		};
		return json(response, { status });
	}
};
