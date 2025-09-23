import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import type { tournament, participation, teams, match, user } from './schema';

export type UserSelectModel = InferSelectModel<typeof user>;
export type UserInsertModel = InferInsertModel<typeof user>;

export type TournamentSelectModel = InferSelectModel<typeof tournament>;
export type TournamentInsertModel = InferInsertModel<typeof tournament>;

export type ParticipationSelectModel = InferSelectModel<typeof participation>;
export type ParticipationInsertModel = InferInsertModel<typeof participation>;

export type TeamsSelectModel = InferSelectModel<typeof teams>;
export type TeamsInsertModel = InferInsertModel<typeof teams>;

export type MatchSelectModel = InferSelectModel<typeof match>;
export type MatchInsertModel = InferInsertModel<typeof match>;

// Participation + user
export type ParticipationsWithUsers = ParticipationSelectModel & {
	user: UserSelectModel;
	tournament: TournamentSelectModel;
};

// Team + players + tournament
export type TeamWithPlayers = TeamsSelectModel & {
	participationPlayerOne: ParticipationsWithUsers;
	participationPlayerTwo: ParticipationsWithUsers;
	tournament: TournamentSelectModel;
};

// Match + team details + tournament
export type MatchWithDetails = MatchSelectModel & {
	tournament: TournamentSelectModel;
	team1: TeamWithPlayers;
	team2: TeamWithPlayers;
	winner: TeamWithPlayers | null;
};
