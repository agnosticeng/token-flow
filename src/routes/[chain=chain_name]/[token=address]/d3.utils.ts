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

export function context2d(
	canvas: HTMLCanvasElement | null | undefined,
	width: number,
	height: number
) {
	if (!canvas) return null;
	const dpi = window.devicePixelRatio;
	canvas.width = width * dpi;
	canvas.height = height * dpi;
	canvas.style.width = width + 'px';
	canvas.style.height = height + 'px';
	const context = canvas.getContext('2d');
	context?.scale(dpi, dpi);
	return context;
}

export function ref<T>(initial: T) {
	let current = initial;

	return {
		set(next: T) {
			current = next;
		},
		get() {
			return current;
		}
	};
}
