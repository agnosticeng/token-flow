<script lang="ts">
	import { browser } from '$app/environment';
	import type { ActionReturn } from 'svelte/action';
	import type { PageData } from './$types';
	import * as d3 from 'd3';
	import { page } from '$app/stores';
	import Canvas from './Canvas.svelte';

	export let data: PageData;

	const pack = d3.pack<{ children: typeof data.holders }>().size([100, 100]).padding(3);

	$: nodes = pack(
		// @ts-expect-error bad lib typing
		d3.hierarchy({ children: data.holders }).sum((d) => parseFloat(d.percent as string))
	).leaves();

	$: simulation = d3
		.forceSimulation(nodes)
		.velocityDecay(0.1)
		.force(
			'collide',
			d3
				.forceCollide<Node>()
				.radius((d) => d.r + 1)
				.iterations(10)
		)
		.force('x', d3.forceX(50))
		.force('y', d3.forceY(50))
		.on('tick', () => {
			if (!browser) return;
			for (let i = 0; i < nodes.length; i++) {
				const circle = document.querySelector(`circle[data-index="${i}"]`);
				if (circle) {
					const d = nodes[i];
					circle.setAttribute('cx', d.x.toString());
					circle.setAttribute('cy', d.y.toString());
				}
			}
		});

	type Node = (typeof nodes)[number] & { fx?: number | null; fy?: number | null };
	function dom<E extends Element>(
		node: E,
		callback: (n: d3.Selection<E, unknown, null, undefined>) => unknown
	): ActionReturn<(n: d3.Selection<E, unknown, null, undefined>) => unknown> {
		callback(d3.select(node));

		return {
			update(c) {
				c(d3.select(node));
			}
		};
	}

	function dragstarted(node: Node): (event: d3.D3DragEvent<Element, unknown, unknown>) => void {
		return (event) => {
			if (!event.active) simulation.alphaTarget(0.3).restart();
			node.fx = node.x;
			node.fy = node.y;
		};
	}

	function dragged(node: Node): (event: d3.D3DragEvent<Element, unknown, unknown>) => void {
		return (event) => {
			node.fx = event.x;
			node.fy = event.y;
		};
	}

	function dragended(node: Node): (event: d3.D3DragEvent<Element, unknown, unknown>) => void {
		return (event) => {
			if (!event.active) simulation.alphaTarget(0);
			node.fx = null;
			node.fy = null;
		};
	}

	function applyDrag(d: Node) {
		return (node: d3.Selection<Element, unknown, null, undefined>) => {
			node.call(
				d3.drag().on('start', dragstarted(d)).on('drag', dragged(d)).on('end', dragended(d))
			);
		};
	}

	$: canvas = $page.url.searchParams.has('canvas');
</script>

{#if canvas}
	<Canvas holders={data.holders} />
{:else}
	<svg viewBox="0 0 100 100" preserveAspectRatio="none" text-anchor="middle">
		<g fill-opacity="0.7" fill="#6536a3" stroke="#6536a3">
			{#each nodes as d, i}
				<circle data-index={i} r={d.r} cx={d.x} cy={d.y} use:dom={applyDrag(d)} />
			{/each}
		</g>
	</svg>
{/if}

<style>
	svg {
		position: relative;
		overflow: visible;
		height: 100%;
		width: 100%;
	}

	svg :global(*) {
		vector-effect: non-scaling-stroke;
	}
</style>
