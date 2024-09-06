<script lang="ts">
	import { browser } from '$app/environment';
	import * as d3 from 'd3';
	import { selection } from './d3.utils';

	type Holder = { wallet: string; amount: number; percent: number };

	export let holders: Holder[];
	export let width: number = 100;
	export let height: number = 100;

	const pack = d3.pack<{ children: Holder[] }>().size([width, height]).padding(3);

	$: nodes = pack(
		// @ts-expect-error bad lib typing
		d3.hierarchy({ children: holders }).sum((d) => d.percent)
	).leaves();

	type Node = (typeof nodes)[number] & { fx?: number | null; fy?: number | null };

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

	function dragstarted(node: Node): (event: d3.D3DragEvent<Element, unknown, unknown>) => void {
		return (event) => {
			if (event.sourceEvent.target instanceof SVGCircleElement)
				d3.select(event.sourceEvent.target).raise().attr('style', 'cursor: grabbing;');
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
			if (event.sourceEvent.target instanceof SVGCircleElement)
				d3.select(event.sourceEvent.target).attr('style', null);
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

	let g: SVGGElement;

	$: zoom = d3
		.zoom()
		.extent([
			[0, 0],
			[width, height]
		])
		.scaleExtent([0.2, 4])
		.on('zoom', ({ transform }) => g.setAttribute('transform', transform));
</script>

<svg
	viewBox="0 0 {width} {height}"
	preserveAspectRatio="none"
	text-anchor="middle"
	use:selection={(node) => {
		// @ts-expect-error Bad typings
		node.call(zoom);
	}}
>
	<g fill="#6536a3" stroke="#6536a3" bind:this={g}>
		{#each nodes as d, i}
			<circle data-index={i} r={d.r} cx={d.x} cy={d.y} use:selection={applyDrag(d)} />
		{/each}
	</g>
</svg>

<style>
	svg {
		position: relative;
		overflow: visible;

		aspect-ratio: 1 / 1;

		& > g > circle {
			fill-opacity: 0.2;

			&:hover {
				fill-opacity: 0.8;
				stroke: #fff;
				cursor: pointer;
			}
		}
	}

	svg :global(*) {
		vector-effect: non-scaling-stroke;
	}
</style>
