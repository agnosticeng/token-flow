<script lang="ts">
	import * as d3 from 'd3';
	import { selection } from './d3.utils';

	type Holder = { wallet: string; amount: number; percent: number };

	export let holders: Holder[];
	export let width: number = 100;
	export let height: number = 100;

	const pack = d3
		.pack<{ children: Holder[] }>()
		.size([width, height])
		.padding((n) => n.r + 15);

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
				.radius((d) => d.r + 15)
				.iterations(10)
		)
		.force('x', d3.forceX(width / 2).strength(0.002))
		.force('y', d3.forceY(height / 2).strength(0.002))
		.on('tick', () => {
			for (let i = 0; i < nodes.length; i++) {
				const circle = document.querySelector(`circle[data-index="${i}"]`);
				if (circle) {
					const d = nodes[i];
					circle.setAttribute('cx', d.x.toString());
					circle.setAttribute('cy', d.y.toString());
				}
			}
		});

	function dragstarted(event: d3.D3DragEvent<Element, unknown, Node>) {
		if (event.sourceEvent.target instanceof SVGCircleElement)
			d3.select(event.sourceEvent.target).raise().attr('style', 'cursor: grabbing;');
		if (!event.active) simulation.alphaTarget(0.3).restart();
		event.subject.fx = event.subject.x;
		event.subject.fy = event.subject.y;
	}

	function dragged(event: d3.D3DragEvent<Element, unknown, Node>) {
		event.subject.fx = event.x;
		event.subject.fy = event.y;
	}

	function dragended(event: d3.D3DragEvent<Element, unknown, Node>) {
		if (event.sourceEvent.target instanceof SVGCircleElement)
			d3.select(event.sourceEvent.target).attr('style', null);
		if (!event.active) simulation.alphaTarget(0);
		event.subject.fx = null;
		event.subject.fy = null;
	}

	function applyDrag(d: Node) {
		return (node: d3.Selection<Element, unknown, null, undefined>) => {
			node.call(
				// @ts-expect-error bad typing
				d3.drag().subject(d).on('start', dragstarted).on('drag', dragged).on('end', dragended)
			);
		};
	}

	$: zoom = d3
		.zoom()
		.extent([
			[0, 0],
			[width, height]
		])
		.scaleExtent([0.2, 4])
		.on('zoom', ({ transform }) => g.setAttribute('transform', transform));

	let g: SVGGElement;
	let svg: SVGElement;
</script>

<svg
	viewBox="0 0 {width} {height}"
	text-anchor="middle"
	{width}
	{height}
	bind:this={svg}
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

<section>
	<button
		on:click={() => {
			// @ts-expect-error lib bad typing
			d3.select(svg).call(zoom.scaleBy, 2);
		}}
		><div data-kind="body/accent">+</div>
	</button>
	<button
		on:click={() => {
			// @ts-expect-error lib bad typing
			d3.select(svg).call(zoom.scaleBy, 0.5);
		}}><div data-kind="body/accent">-</div></button
	>
</section>

<style>
	svg {
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

	section {
		position: absolute;
		right: 10px;
		bottom: 10px;

		display: flex;
		align-items: center;

		gap: 24px;

		& > button {
			& > div {
				--lighten-color: hsl(0deg 0% 70% / 38%);

				display: grid;
				place-items: center;

				border-radius: 8px;
				height: 30px;
				aspect-ratio: 1/1;
				cursor: pointer;
			}

			&:not(:disabled):hover > div {
				background-color: hsl(220deg 6% 91% / 100%);
				color: hsl(0deg 0% 13% / 100%);
			}

			&:not(:disabled):active > div {
				background-image: linear-gradient(to right, var(--lighten-color), var(--lighten-color));
			}
		}
	}
</style>
