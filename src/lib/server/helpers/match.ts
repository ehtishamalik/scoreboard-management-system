import type { MatchInsertModel, TeamsSelectModel } from '../db/types';

/**
 * Generate a round-robin schedule (list of rounds, each containing pairs of teamIds).
 */
export function generateRoundRobinSchedule(teams: TeamsSelectModel[]): [string, string][][] {
	// If odd number of teams, add a dummy (bye)
	if (teams.length % 2 !== 0) {
		teams.push({ id: 'BYE', name: 'BYE', tournamentId: '' } as TeamsSelectModel);
	}

	const n = teams.length;
	const rounds: [string, string][][] = [];

	// Create an array of team ids
	const teamIds = teams.map((t) => t.id);

	for (let round = 0; round < n - 1; round++) {
		const matches: [string, string][] = [];

		for (let i = 0; i < n / 2; i++) {
			const t1 = teamIds[i];
			const t2 = teamIds[n - 1 - i];
			if (t1 !== 'BYE' && t2 !== 'BYE') {
				matches.push([t1, t2]);
			}
		}

		rounds.push(matches);

		// rotate (except the first team)
		teamIds.splice(1, 0, teamIds.pop()!);
	}

	return rounds;
}

/**
 * Assign generated matches to dates based on MATCHES_PER_DAY capacity.
 */
export function assignMatchesToDates(
	rounds: [string, string][][],
	startDateStr: string,
	matchesPerDay: Map<number, number>
): MatchInsertModel[] {
	// sanity: at least one valid day
	const totalWeeklyCapacity = Array.from(matchesPerDay.values()).reduce((s, v) => s + v, 0);
	if (totalWeeklyCapacity === 0) {
		throw new Error('Weekly capacity is zero for all days — cannot schedule matches.');
	}

	const startDate = new Date(startDateStr);
	let currentDate = new Date(startDate); // local date

	const scheduled: MatchInsertModel[] = [];

	// helper: format date as YYYY-MM-DD using local parts (avoid UTC shift)
	const formatLocalDate = (d: Date) => {
		const y = d.getFullYear();
		const m = String(d.getMonth() + 1).padStart(2, '0');
		const day = String(d.getDate()).padStart(2, '0');
		return `${y}-${m}-${day}`;
	};

	// advance to the next valid day that has capacity
	const advanceToNextAllowedDay = (date: Date) => {
		let guard = 0;
		do {
			date.setDate(date.getDate() + 1);
			guard++;
			if (guard > 14) throw new Error('Unable to find next valid day within 2 weeks.');
		} while ((matchesPerDay.get(date.getDay()) ?? 0) <= 0);
		return date;
	};

	for (const round of rounds) {
		let roundMatches = [...round];

		while (roundMatches.length > 0) {
			const dayOfWeek = currentDate.getDay();
			let todayCapacity = matchesPerDay.get(dayOfWeek) ?? 0;

			if (todayCapacity <= 0) {
				currentDate = advanceToNextAllowedDay(currentDate);
				continue;
			}

			// count how many matches are already scheduled on this day
			const alreadyToday = scheduled.filter(
				(m) => m.playDate === formatLocalDate(currentDate)
			).length;

			const remainingCapacity = todayCapacity - alreadyToday;
			if (remainingCapacity <= 0) {
				currentDate = advanceToNextAllowedDay(currentDate);
				continue;
			}

			// schedule up to remaining capacity
			const take = Math.min(remainingCapacity, roundMatches.length);
			const todayMatches = roundMatches.splice(0, take);

			for (const [team1Id, team2Id] of todayMatches) {
				scheduled.push({
					tournamentId: '', // filled later in DB insert
					team1Id,
					team2Id,
					playDate: formatLocalDate(currentDate),
					team1Points: 0,
					team2Points: 0
				});
			}

			// If the round still has matches left, go to next valid day
			if (roundMatches.length > 0) {
				currentDate = advanceToNextAllowedDay(currentDate);
			}
		}

		// After finishing a round:
		// - If the current day still has capacity left → next round can continue same day.
		// - Else → advance to the next allowed day.
		const dayOfWeek = currentDate.getDay();
		const todayCapacity = matchesPerDay.get(dayOfWeek) ?? 0;
		const alreadyToday = scheduled.filter(
			(m) => m.playDate === formatLocalDate(currentDate)
		).length;

		if (alreadyToday >= todayCapacity) {
			currentDate = advanceToNextAllowedDay(currentDate);
		}
	}

	return scheduled;
}
