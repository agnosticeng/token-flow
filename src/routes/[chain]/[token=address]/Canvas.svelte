<script lang="ts">
	import type { Value } from '$lib/utils/agnostic';
	import * as d3 from 'd3';
	import { onMount } from 'svelte';

	export let holders: Record<string, Value>[];

	$: nodes = holders.map((d, i) => ({
		index: i,
		wallet: d.wallet as string,
		percent: parseFloat(d.percent as string),
		r: parseFloat(d.percent as string) * 2_000,
		x: 0,
		y: 0
	}));

	$: d3.forceSimulation(nodes)
		.alphaTarget(0.3)
		.force('charge', d3.forceManyBody().strength(-100))

		.force('x', d3.forceX())
		.force('y', d3.forceY())
		.on('tick', ticked);

	let width: number;
	let height: number;

	let canvas: HTMLCanvasElement;
	$: context = canvas?.getContext('2d');

	onMount(() => {
		const dpi = devicePixelRatio;
		canvas.width = width * dpi;
		canvas.height = height * dpi;
		context?.scale(dpi, dpi);
	});

	function ticked() {
		if (!context) return;
		context.clearRect(0, 0, width, height);
		context.save();
		context.translate(width / 2, height / 2);
		for (let i = 1; i < nodes.length; ++i) {
			const d = nodes[i];
			context.beginPath();
			context.moveTo(d.x + d.r, d.y);
			context.arc(d.x, d.y, d.r, 0, 2 * Math.PI);
			context.fillStyle = '#6536a3';
			context.fill();
			context.strokeStyle = '#6637a4b3';
		}
		context.restore();
	}
</script>

<svelte:window bind:innerWidth={width} bind:innerHeight={height} />

<canvas bind:this={canvas} />

<style>
	canvas {
		position: fixed;
		inset: 0;
	}
</style>
