<script lang="ts">
	import type { PageData } from './$types';
	import * as d3 from 'd3';

	export let data: PageData;

	const pack = d3.pack<{ children: typeof data.holders }>().size([100, 100]).padding(3);

	$: root = pack(
		// @ts-expect-error bad lib typing
		d3.hierarchy({ children: data.holders }).sum((d) => parseFloat(d.percent as string))
	);
</script>

<svg viewBox="0 0 100 100" preserveAspectRatio="none" text-anchor="middle">
	{#each root.leaves() as d}
		<g transform="translate({d.x},{d.y})">
			<circle fill-opacity="0.7" fill="#6536a3" stroke="#6536a3" r={d.r} />
		</g>
	{/each}
</svg>

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
