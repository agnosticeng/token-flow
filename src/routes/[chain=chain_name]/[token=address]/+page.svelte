<script lang="ts">
	import type { PageData } from './$types';
	import Graph from './Graph.svelte';

	export let data: PageData;

	let height: number;
	let width: number;
</script>

<svelte:head>
	<title>{data.token.symbol} TokenFlow</title>
</svelte:head>

<header>
	<div>
		<img src={data.token.logoURI} alt="{data.token.name} 's Icon" />
		<span data-kind="headline/h3">{data.token.name}</span>
	</div>
</header>
<section bind:clientWidth={width} bind:clientHeight={height}>
	{#if height && width}
		<Graph holders={data.holders} {height} {width} />
	{/if}
</section>

<style>
	header {
		height: 64px;
		width: 100%;
		background-color: hsl(270deg 14% 12%);
		position: relative;
		z-index: 1;
		padding: 0 64px;

		@media screen and (max-width: 768px) {
			padding: 0 32px;
		}

		@media screen and (max-width: 576px) {
			padding: 0 16px;
		}

		& > div {
			height: 100%;

			display: flex;
			align-items: center;
			gap: 14px;

			& > img {
				width: 24px;
				height: 24px;
				border-radius: 50%;
			}
		}
	}

	section {
		height: calc(100% - 64px);
		width: 100%;

		position: relative;
	}
</style>
