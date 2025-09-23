// place files you want to import through the `$lib` alias in this folder.

import { CalendarDate } from '@internationalized/date';
import { toast } from 'svelte-sonner';

import type { ErrorWithCauseBody } from './types';
import type { MatchWithDetails } from './server/db/types';

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
