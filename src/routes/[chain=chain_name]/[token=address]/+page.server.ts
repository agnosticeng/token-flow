import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { graphql } from '$lib/server/graphql';
import { labels_loader } from '$lib/server/database';

const query = /* GraphQL */ `
	query TokenHoldersWithTransfers($token: String!) {
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

type QueryVariables = { token: string };

export const load = (async (e) => {
	try {
		const [{ data, errors }, { token, chain }] = await Promise.all([
			graphql<QueryResponse, QueryVariables>(
				query,
				{ token: e.params.token },
				'TokenHoldersWithTransfers'
			),
			getInfo(e.params.chain, e.params.token)
		]);

		if (!data) throw errors;

		const holders = await get_holders_from_query_response(data);

		return {
			holders,
			transfers: get_transfers_from_query_response(data),
			token,
			chain_explorer: chain.explorer
		};
	} catch (e) {
		console.error(e);
		error(404);
	}
}) satisfies PageServerLoad;

function get_holders_from_query_response(data: QueryResponse) {
	return Promise.all(
		data?.token_holders?.map(async (d) => {
			const { name, labels } = await labels_loader.load(d.wallet);
			return {
				wallet: d.wallet.toLowerCase(),
				amount: parseFloat(d.amount),
				percent: parseFloat(d.percent),
				name,
				labels
			};
		}) ?? []
	);
}

function get_transfers_from_query_response(data: QueryResponse) {
	if (!data?.track_transfers_between_holders?.length) return [];

	return data.track_transfers_between_holders.map((t) => ({
		source: t.source.toLowerCase(),
		target: t.target.toLowerCase(),
		amount: parseFloat(t.amount)
	}));
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
