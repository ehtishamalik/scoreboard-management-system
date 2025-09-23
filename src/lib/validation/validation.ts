import type { z, ZodObject, ZodRawShape } from 'zod';

/**
 * Validates a request body against a Zod schema and returns a consistent response.
 * @param schema The Zod schema to validate against.
 * @param body The request body to validate.
 * @returns A tuple containing [success, data, errors].
 */
export function handleSchema<T extends ZodRawShape>(
	schema: ZodObject<T>,
	body: unknown
): { success: boolean; data?: z.infer<typeof schema>; errors: string[] } {
	const result = schema.safeParse(body);
	if (!result.success) {
		const errors = result.error.issues.map((err) => err.message);
		return { success: false, errors };
	}

	return { success: true, data: result.data, errors: [] };
}

export function handleSchemaBulk<T>(
	schema: z.ZodType<T>,
	body: unknown
): { success: boolean; data?: T; errors: string[] } {
	const result = schema.safeParse(body);
	if (!result.success) {
		const errors = result.error.issues.map((err) => err.message);
		return { success: false, errors };
	}
	return { success: true, data: result.data, errors: [] };
}
