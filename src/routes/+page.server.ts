import { body, type ExecutionResult } from '$lib/server/graphql';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

const query = /* GraphQL */ `
	query Tokens($chain: Chain = Ethereum) {
		COMP: token(input: { chain: $chain, address: "0xc00e94cb662c3520282e6f5717214004a7f26888" }) {
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

		SHIB: token(input: { chain: $chain, address: "0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce" }) {
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

		UNI: token(input: { chain: $chain, address: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984" }) {
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

		stETH: token(input: { chain: $chain, address: "0xae7ab96520de3a18e5e111b5eaab095312d7fe84" }) {
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
	}
`;

export const load = (async () => {
	const { data } = await fetch('https://assets.agnostic.dev/graphql', {
		method: 'POST',
		headers: { 'Content-type': 'application/json' },
		body: body(query, undefined, 'Tokens')
	}).then((r) => r.json<ExecutionResult<Query>>());
	if (!data) error(400);

	return { tokens: Object.values(data).map((d) => d.token) };
}) satisfies PageServerLoad;

type Token = {
	id: string;
	address: string;
	name: string;
	symbol: string;
	decimals: string;
	logoURI: string;
	links?: { name: string; url: string }[];
};

type Query = {
	COMP: { token: Token };
	SHIB: { token: Token };
	UNI: { token: Token };
	stETH: { token: Token };
};
