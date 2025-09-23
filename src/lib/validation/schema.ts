import { z } from 'zod';

export const zodTournamentSchema = z.object({
	name: z.string().min(3, 'Name must be at least 3 characters long'),
	startDate: z.iso.date().optional().nullish(),
	endDate: z.iso.date().optional().nullish(),
	isActive: z.boolean().default(true).optional(),
	isFinalized: z.boolean().default(false).optional()
});

export const zodParticipationSchema = z.object({
	userId: z.string().min(1, 'User ID is required'),
	tournamentId: z.string().min(1, 'Tournament ID is required')
});

export const zodBulkParticipationSchema = z
	.array(zodParticipationSchema)
	.min(1, 'At least one participation is required')
	.refine(
		(participations) => {
			const tournamentIds = new Set(participations.map((p) => p.tournamentId));
			return tournamentIds.size === 1;
		},
		{ message: 'All participations must have the same tournamentId' }
	);

export const zodTeamSchema = z.object({
	name: z.string().min(1, 'Team name must be at least 1 character long'),
	participationPlayerOne: z.string().min(1, 'Player one ID is required'),
	participationPlayerTwo: z.string().min(1, 'Player two ID is required'),
	tournamentId: z.string().min(1, 'Tournament ID is required')
});

export const zodBulkTeamsSchema = z
	.array(zodTeamSchema)
	.min(1, 'At least one team is required')
	.refine(
		(teams) => {
			const tournamentIds = new Set(teams.map((t) => t.tournamentId));
			return tournamentIds.size === 1;
		},
		{ message: 'All teams must have the same tournamentId' }
	);

export const zodMatchSchema = z.object({
	tournamentId: z.string().min(1, 'Tournament ID is required'),
	team1Id: z.string().min(1, 'Team 1 ID is required'),
	team2Id: z.string().min(1, 'Team 2 ID is required'),
	team1Points: z.number().int().min(0).default(0).optional(),
	team2Points: z.number().int().min(0).default(0).optional(),
	type: z.enum(['ROUNDROBIN', 'SEMIFINAL', 'FINAL']).default('ROUNDROBIN').optional(),
	winnerId: z.string().optional().nullable(),
	playDate: z.iso.date()
});
