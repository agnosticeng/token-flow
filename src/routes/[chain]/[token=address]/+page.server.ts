import type { PageServerLoad } from './$types';
import { AGNOSTIC_TOKEN } from '$env/static/private';
import { error } from '@sveltejs/kit';

const query = /* GraphQL */ `
	query TokenHoldersByTransfers($token: String!) {
		token_holders_by_transfers(token: $token) {
			wallet
			amount
			percent
		}
	}
`;

type QueryResponse = {
	data?: {
		token_holders_by_transfers?: {
			wallet: string;
			amount: string;
			percent: string;
		}[];
	};
};

type QueryVariables = { token: string };

export const load = (async (e) => {
	try {
		const response = await fetch('https://graphql.eu-west-1.agnostic.engineering/graphql', {
			method: 'POST',
			headers: { Authorization: AGNOSTIC_TOKEN },
			body: body<QueryVariables>(query, { token: e.params.token })
		}).then((r) => r.json<QueryResponse>());

		return { holders: transform(response) };
	} catch (e) {
		console.error(e);
		error(404);
	}
}) satisfies PageServerLoad;

function body<T extends object | null | undefined>(query: string, variables?: T) {
	return JSON.stringify({ query, variables });
}

function transform({ data }: QueryResponse) {
	if (!data?.token_holders_by_transfers?.length) return [];

	return data.token_holders_by_transfers.map((d) => ({
		wallet: d.wallet,
		amount: parseFloat(d.amount),
		percent: parseFloat(d.percent)
	}));
}
