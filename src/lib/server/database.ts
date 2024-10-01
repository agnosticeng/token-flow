import { createClient } from '@libsql/client';
import { LABELS_DB_URL, LABELS_DB_AUTH_TOKEN } from '$env/static/private';
import DataLoader from 'dataloader';

export const db = createClient({
	url: LABELS_DB_URL,
	authToken: LABELS_DB_AUTH_TOKEN
});

export const labels_loader = new DataLoader(async (keys: readonly string[]) => {
	const placeholders = new Array(keys.length).fill('?').join(', ');

	const { rows } = await db.execute({
		sql: `SELECT
        address,
        name_tag,
        GROUP_CONCAT(label) as labels
      FROM
        \`accounts\`
      WHERE
        chain_id = '1'
        AND address IN (${placeholders}) COLLATE NOCASE
      GROUP BY address, name_tag
    `,
		args: keys as string[]
	});

	return keys.map((k) => {
		const r = rows.find((row) => row.address === k);

		return {
			address: k,
			name: r?.name_tag?.toString(),
			labels: r?.labels?.toString()?.split(',')
		};
	});
});
