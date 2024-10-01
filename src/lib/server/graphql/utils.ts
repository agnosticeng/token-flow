export function body<T extends object | null | undefined>(
	query: string,
	variables?: T,
	operationName?: string
) {
	return JSON.stringify({ query, variables, operationName });
}
