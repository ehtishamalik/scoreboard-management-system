// place files you want to import through the `$lib` alias in this folder.

import { CalendarDate } from '@internationalized/date';
import { toast } from 'svelte-sonner';

import type { ErrorWithCauseBody } from './types';
import type { MatchWithDetails, MatchSeriesWithDetails } from './server/db/types';

// Higher order function to handle errors
export const withErrorHandling = async (fn: () => Promise<void>, error: string) => {
  const handleRefresh = () => {
    window.location.reload();
  };
  try {
    await fn();
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    console.error(err);
    toast.error(error, {
      description: errorMessage,
      action: {
        label: 'Refresh',
        onClick: handleRefresh
      }
    });
  }
};

export const handleUserErrors = (error: ErrorWithCauseBody) => {
  toast.error(error.cause || 'Unknown Error Occurred', {
    description: error.message
  });
};

export const getCalenderDate = (date: Date | undefined) => {
  if (!date) return;
  return new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
};

export const getMatchWinner = (match: MatchWithDetails, fromId: boolean) => {
  if (match.team1Points === 0 && match.team2Points === 0) {
    return fromId ? null : 'No Winner Yet';
  } else if (match.team1Points > match.team2Points) {
    return fromId ? match.team1Id : match.team1.name;
  } else {
    return fromId ? match.team2Id : match.team2.name;
  }
};

export const getMatchSeriesWinner = (series: MatchSeriesWithDetails, fromId = false) => {
  // Count how many games each team has won
  let team1Wins = 0;
  let team2Wins = 0;

  const games = [
    [series.game1Team1Points, series.game1Team2Points],
    [series.game2Team1Points, series.game2Team2Points],
    [series.game3Team1Points, series.game3Team2Points]
  ];

  for (const [team1Points, team2Points] of games) {
    // Skip games that haven't been played yet
    if (team1Points === 0 && team2Points === 0) continue;

    if (team1Points > team2Points) team1Wins++;
    else if (team2Points > team1Points) team2Wins++;
  }

  // Best of three — whoever wins 2 games first
  if (team1Wins >= 2) {
    return fromId ? series.team1Id : series.team1.name;
  } else if (team2Wins >= 2) {
    return fromId ? series.team2Id : series.team2.name;
  } else {
    return null;
  }
};
