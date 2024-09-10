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

		return {
			holders: transform(response),
			token: await getTokenInfo(e.params.chain, e.params.token)
		};
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

async function getTokenInfo(chain: string, address: `0x${string}`) {
	const query = /* GraphQL */ `
		query Token($input: TokenInput!) {
			token(input: $input) {
				token {
					id
					address
					name
					symbol
					decimals
					logoURI
				}
			}
		}
	`;

	const { data } = await fetch('https://assets.agnostic.dev/graphql', {
		method: 'POST',
		headers: { 'Content-type': 'application/json' },
		body: JSON.stringify({
			query,
			variables: { input: { address, chain: capitalize(chain) } },
			operationName: 'Token'
		})
	}).then((r) =>
		r.json<{
			data: {
				token: {
					token: {
						id: string;
						address: string;
						name: string;
						symbol: string;
						decimals: string;
						logoURI: string;
					};
				};
			};
		}>()
	);

	return data.token.token;
}

function capitalize(s: string) {
	return s.slice(0, 1).toUpperCase() + s.slice(1);
}
