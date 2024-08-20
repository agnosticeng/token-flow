import type { PageServerLoad } from './$types';
import { AGNOSTIC_TOKEN } from '$env/static/private';
import { error } from '@sveltejs/kit';
import type { ResultSet, Value } from '$lib/utils/agnostic';

const sql = /* SQL */ `
with
	'Transfer(address,address,uint256)' as transfer_event,
	'0x000000000000000000000000000000000000dead' as dead_address,
	'<token>' as token,
  (select argMax(value, block_number) from token_total_supplies_ethereum_mainnet_v1 where token_address = token) as total_supply,

	transfers as (
  	select
  		input_0_value_address as sender,
  		input_1_value_address as recipient,
  		input_2_value_uint256 as amount
  	from
  		evm_events_ethereum_mainnet_v1
  	where address = token
  		and signature = transfer_event
  		and	transaction_status != 0
  ),

	transfers_agg as (
  	select sender as wallet, sum(amount) as amount, 'out' as transfer_type from transfers group by wallet
  	union all
  	select recipient as wallet, sum(amount) as amount, 'in' as transfer_type from transfers group by wallet
  )

select
	wallet,
	sum(
  	case 
  		when transfer_type = 'in' then toInt256(amount)
  	  when transfer_type = 'out' then toInt256(amount) * -1
  		else 0
  	end
  ) as amount,
  amount / total_supply as percent
from transfers_agg
where wallet != dead_address
group by wallet
order by percent desc
limit 150
`;

export const load = (async (e) => {
	try {
		const data = await fetch('https://sql.eu-west-1.agnostic.engineering/query', {
			method: 'POST',
			headers: {
				Authorization: AGNOSTIC_TOKEN
			},
			body: sql.replace(/<token>/, e.params.token)
		}).then((r) => r.json<ResultSet>());

		return {
			holders:
				data.rows?.map((r) =>
					r.reduce(
						(o, k, i) => ({ ...o, [data.column_descriptors[i].name]: k }),
						{} as Record<string, Value>
					)
				) ?? []
		};
	} catch (e) {
		console.error(e);
		error(404);
	}
}) satisfies PageServerLoad;
