<script lang="ts">
	import { truncate } from '$lib/utils/string';
	import type { PageData } from './$types';
	import Graph, { type Holder } from './Graph.svelte';

	export let data: PageData;

	let height: number;
	let width: number;

	let selected: Holder | null = null;

	function formatPercent(r: number) {
		return Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 3 }).format(r);
	}
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
	{#if selected}
		<article class="Wallet_Details" data-kind="small/regular">
			<div>
				<span data-kind="body/accent">Selected Wallet</span>
				<button on:click={() => (selected = null)}><div data-kind="headline/h3">⛌</div></button>
			</div>
			<div>
				<a
					target="_blank"
					rel="noopener noreferrer"
					data-sveltekit-preload-data="off"
					aria-label="Explorer address link"
					href="https://etherscan.io/address/{selected.wallet}">{truncate(selected.wallet, 7)}</a
				>
			</div>
			<div>
				Wallet Rank: <span data-kind="small/accent">#{data.holders.indexOf(selected) + 1}</span>
			</div>
			<div>Percentage: <span data-kind="small/accent">{formatPercent(selected.percent)}</span></div>
		</article>
	{/if}

	{#if height && width}
		<Graph holders={data.holders} {height} {width} bind:selected />
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

		& > article {
			position: absolute;
			left: 10px;
			top: 10px;
			background-color: hsl(270deg 14% 12%);
			border-radius: 8px;
			padding: 12px;

			& > div:nth-child(1) {
				display: flex;
				align-items: center;
				gap: 12px;
			}

			& > div:nth-child(2) {
				margin-bottom: 5px;
			}
		}

		& a {
			color: hsl(322deg 74% 50%);
		}

		& button {
			& > div {
				display: grid;
				place-items: center;
				cursor: pointer;

				opacity: 0.7;
			}

			&:hover > div {
				opacity: 1;
			}
		}
	}
</style>
