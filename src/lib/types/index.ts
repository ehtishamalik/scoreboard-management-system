import { auth } from '$lib/server/auth';
import type { MATCH_TYPE, ROLE } from '$lib/server/db/schema';

type SuccessResponse<T> = {
  success: true;
  data: T;
};

type ErrorResponse = {
  success: false;
  error: ErrorWithCauseBody;
};

export type ErrorWithCauseBody = { message: string; cause: string };

export type ErrorWithCause = { status: number; body: ErrorWithCauseBody };

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

export type SessionType = Awaited<ReturnType<typeof auth.api.getSession>>;

export type TournamentStanding = {
  teamId: string;
  teamName: string;
  W: number;
  L: number;
  PCT: number;
  PF: number;
  PA: number;
  PD: number;
  PTS: number;
};

export type MatchType = (typeof MATCH_TYPE.enumValues)[number];

export type RoleType = (typeof ROLE.enumValues)[number];

export type ColumnType =
  | 'index'
  | 'team_1'
  | 'team_1_points'
  | 'team_2'
  | 'team_2_points'
  | 'winner'
  | 'play_date';

export type SelectedColumns = Array<ColumnType>;

export type UserPerformanceStats = {
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: number;
  totalPointsFor: number;
  totalPointsAgainst: number;
  avgPointsPerMatch: number;
  pointsHistory: { date: string; points: number }[];
  globalAvgWinRate: number;
  globalAvgPoints: number;
};
