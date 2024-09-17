<script lang="ts" context="module">
	export type Holder = { wallet: string; amount: number; percent: number };
	export type Transfer = { source: string; target: string; amount: number };

	type Node = d3.HierarchyCircularNode<Holder> & d3.SimulationNodeDatum;
</script>

<script lang="ts">
	import * as d3 from 'd3';
	import { selection } from './d3.utils';

	export let holders: Holder[];
	export let transfers: Transfer[];
	export let width: number = 100;
	export let height: number = 100;
	export let selected: Holder | null = null;

	const pack = d3
		.pack<Holder>()
		.size([width, height])
		.padding((n) => n.r + 15);

	$: nodes = pack(
		d3.hierarchy({ children: holders } as unknown as Holder).sum((d) => d.percent)
	).leaves();

	const simulation = d3
		.forceSimulation<Node, d3.SimulationLinkDatum<Node>>()
		.force(
			'link',
			d3
				.forceLink<Node, d3.SimulationLinkDatum<Node>>()
				.id((d) => d.data.wallet)
				.distance((r) => (r.source as Node).r + (r.target as Node).r + 50)
		)
		.force('charge', d3.forceManyBody())
		.force('center', d3.forceCenter(width / 2, height / 2).strength(0.002))
		.on('tick', ticked);

	$: {
		const old = new Map(simulation.nodes().map((n) => [n.data.wallet, n]));
		simulation.nodes(nodes.map((n) => Object.assign(n, old.get(n.data.wallet))));
		simulation
			.force<d3.ForceLink<Node, d3.SimulationLinkDatum<Node>>>('link')!
			.links(transfers.map((t) => Object.assign({}, t)));
		simulation.alpha(1).restart();
	}

	function ticked() {
		const nodes = simulation.nodes();
		for (let i = 0; i < nodes.length; i++) {
			const circle = document.querySelector(`circle[data-index="${i}"]`);
			if (circle) {
				const d = nodes[i];
				circle.setAttribute('cx', d.x.toString());
				circle.setAttribute('cy', d.y.toString());
			}
		}

		const links = simulation
			.force<d3.ForceLink<Node, d3.SimulationLinkDatum<Node>>>('link')!
			.links();

		for (let i = 0; i < links.length; i++) {
			const line = document.querySelector(`line[data-index="${i}"]`);
			if (line) {
				const d = links[i];
				line.setAttribute('x1', (d.source as Node).x.toString());
				line.setAttribute('y1', (d.source as Node).y.toString());
				line.setAttribute('x2', (d.target as Node).x.toString());
				line.setAttribute('y2', (d.target as Node).y.toString());
			}
		}
	}

	function dragstarted(event: d3.D3DragEvent<Element, unknown, Node>) {
		if (event.sourceEvent.target instanceof SVGCircleElement)
			d3.select(event.sourceEvent.target).raise().attr('style', 'cursor: grabbing;');
		if (!event.active) simulation.alphaTarget(0.3).restart();
		event.subject.fx = event.subject.x;
		event.subject.fy = event.subject.y;
	}

	let hasMoved = false;
	function dragged(event: d3.D3DragEvent<Element, unknown, Node>) {
		hasMoved = true;
		event.subject.fx = event.x;
		event.subject.fy = event.y;
	}

	function dragended(event: d3.D3DragEvent<Element, unknown, Node>) {
		if (event.sourceEvent.target instanceof SVGCircleElement)
			d3.select(event.sourceEvent.target).attr('style', null);
		if (!event.active) simulation.alphaTarget(0);
		if (!hasMoved) selected = event.subject.data;
		hasMoved = false;
		event.subject.fx = null;
		event.subject.fy = null;
	}

	function applyDrag<E extends Element>(d: Node) {
		return (node: d3.Selection<E, unknown, null, undefined>) => {
			node.call(
				d3
					.drag<E, unknown, Node>()
					.subject(() => d)
					.on('start', dragstarted)
					.on('drag', dragged)
					.on('end', dragended)
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
	<defs>
		<marker
			id="arrow"
			markerWidth="8"
			markerHeight="6"
			refX="7"
			refY="3"
			orient="auto"
			markerUnits="userSpaceOnUse"
		>
			<polygon points="0 0, 8 3, 0 6" fill="#fff" />
		</marker>
	</defs>
	<g fill="#6536a3" stroke="#6536a3" bind:this={g}>
		<g class="circles">
			{#each nodes as d, i (d.data.wallet)}
				<circle
					data-index={i}
					r={d.r}
					cx={d.x}
					cy={d.y}
					use:selection={applyDrag(d)}
					class:Selected={selected === d.data}
				/>
			{/each}
		</g>
		<g class="lines">
			{#each transfers as _, i}
				<line
					data-index={i}
					stroke="#fff"
					stroke-width="1"
					stroke-opacity="0.6"
					marker-end="url(#arrow)"
				/>
			{/each}
		</g>
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

		& g.circles > circle {
			fill-opacity: 0.2;

			&:hover {
				fill-opacity: 0.8;
				stroke: #fff;
				cursor: pointer;
			}

			&.Selected {
				stroke: #fff;
				stroke-width: 3px;
				fill-opacity: 0.7;
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
