import { select, type Selection } from 'd3';
import type { ActionReturn } from 'svelte/action';

export function selection<E extends Element>(
	node: E,
	callback: (n: Selection<E, unknown, null, undefined>) => unknown
): ActionReturn<(n: Selection<E, unknown, null, undefined>) => unknown> {
	callback(select(node));

	return {
		update(c) {
			c(select(node));
		}
	};
}
