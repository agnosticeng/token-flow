import type { PageServerLoad } from './$types';
import { AGNOSTIC_TOKEN } from '$env/static/private';
import { error } from '@sveltejs/kit';

const query = /* GraphQL */ `
	query TokenHoldersByTransfers($token: String!) {
		token_holders(token: $token) {
			wallet
			amount
			percent
		}

		track_transfers_between_holders(token: $token) {
			source
			target
			amount
		}
	}
`;

type QueryResponse = {
	data?: {
		token_holders?: {
			wallet: string;
			amount: string;
			percent: string;
		}[];

		track_transfers_between_holders?: {
			source: string;
			target: string;
			amount: string;
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

		const { token, chain } = await getInfo(e.params.chain, e.params.token);

		return {
			holders: get_holders_from_response(response),
			transfers: get_transfers_from_response(response),
			token,
			chain_explorer: chain.explorer
		};
	} catch (e) {
		console.error(e);
		error(404);
	}
}) satisfies PageServerLoad;

function body<T extends object | null | undefined>(query: string, variables?: T) {
	return JSON.stringify({ query, variables });
}

function get_holders_from_response({ data }: QueryResponse) {
	if (!data?.token_holders?.length) return [];

	return data.token_holders.map((d) => ({
		wallet: d.wallet.toLowerCase(),
		amount: parseFloat(d.amount),
		percent: parseFloat(d.percent)
	}));
}

function get_transfers_from_response({ data }: QueryResponse) {
	if (!data?.track_transfers_between_holders?.length) return [];

	return data.track_transfers_between_holders
		.map((t) => ({
			source: t.source.toLowerCase(),
			target: t.target.toLowerCase(),
			amount: parseFloat(t.amount)
		}))
		.filter((t) => t.source !== t.target);
}

async function getInfo(chain: string, address: `0x${string}`) {
	const query = /* GraphQL */ `
		query Token($chain: Chain!, $address: Address) {
			token(input: { chain: $chain, address: $address }) {
				token {
					id
					address
					name
					symbol
					decimals
					logoURI
					links {
						name
						url
					}
				}
			}

			chain: token(input: { chain: $chain }) {
				info: token {
					name
					explorer
				}
			}
		}
	`;

	const { data } = await fetch('https://assets.agnostic.dev/graphql', {
		method: 'POST',
		headers: { 'Content-type': 'application/json' },
		body: JSON.stringify({
			query,
			variables: { address, chain: capitalize(chain) },
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
						links?: { name: string; url: string }[];
					};
				};
				chain: { info: { name: string; explorer: string } };
			};
		}>()
	);

	return { token: data.token.token, chain: data.chain.info };
}

function capitalize(s: string) {
	return s.slice(0, 1).toUpperCase() + s.slice(1);
}
