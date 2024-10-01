import { AGNOSTIC_TOKEN } from '$env/static/private';
import type { ExecutionResult } from './types';
import { body } from './utils';

const graphql_url = 'https://graphql.eu-west-1.agnostic.engineering/graphql';

export function graphql<TData, Var extends object | null | undefined>(
	query: string,
	variables: Var,
	operationName?: string
) {
	return fetch(graphql_url, {
		method: 'POST',
		headers: { Authorization: AGNOSTIC_TOKEN },
		body: body<Var>(query, variables, operationName)
	}).then((r) => r.json<ExecutionResult<TData>>());
}
