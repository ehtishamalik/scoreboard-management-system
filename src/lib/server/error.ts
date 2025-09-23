import type { ErrorWithCause } from '$lib/types';

export class HttpError extends Error {
	constructor(
		public status: number,
		message: string,
		cause?: string
	) {
		super(message, {
			cause
		});
	}
}

export const handleError = (
	error: unknown,
	messageToLog: string = 'An error occurred'
): ErrorWithCause => {
	if (error instanceof HttpError) {
		return {
			status: error.status,
			body: { message: error.message, cause: (error.cause as string) ?? error.name }
		};
	}

	if (error instanceof Error) {
		return {
			status: 500,
			body: { message: error.message, cause: (error.cause as string) ?? error.name }
		};
	}

	console.error(messageToLog, ': ', error);
	return { status: 500, body: { message: 'Internal Server Error', cause: 'Error' } };
};
