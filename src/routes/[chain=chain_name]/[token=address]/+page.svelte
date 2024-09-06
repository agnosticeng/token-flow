<script lang="ts">
	import type { PageData } from './$types';
	import Graph from './Graph.svelte';

	export let data: PageData;

	let height: number;
	let width: number;
</script>

<section bind:clientWidth={width} bind:clientHeight={height}>
	{#if height && width}
		<Graph holders={data.holders} {height} {width} />
	{/if}
</section>

<style>
	section {
		height: 100%;
		width: 100%;

		position: relative;
	}
</style>
