<script lang="ts">
	import { truncate } from '$lib/utils/string';
	import { writable } from 'svelte/store';
	import { fade, slide } from 'svelte/transition';
	import type { PageData } from './$types';
	import Graph, { type Holder } from './Graph.svelte';
	import {
		Eye,
		EyeSlash,
		ListBullet,
		Square2Stack,
		XMark
	} from '@agnosticeng/heroicons-svelte/outline';

	export let data: PageData;

	let height: number;
	let width: number;

	let selected: Holder | null = null;

	function formatPercent(r: number) {
		return Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 3 }).format(r);
	}

	const open = writable(false);

	let excluded: string[] = [];

	$: if (selected) open.set(true);
</script>

<svelte:head>
	<title>{data.token.symbol} TokenFlow</title>
</svelte:head>

<div class="PageContainer">
	<header>
		<div>
			<img src={data.token.logoURI} alt="{data.token.name} 's Icon" />
			<span data-kind="headline/h3">{data.token.name}</span>
		</div>
	</header>

	<section bind:clientWidth={width} bind:clientHeight={height} class:SideBarOpened={$open}>
		{#if selected}
			<article class="Wallet_Details" data-kind="small/regular">
				<div>
					<span data-kind="body/accent">Selected Wallet</span>
					<button on:click={() => (selected = null)}><div><XMark size="18" /></div></button>
					<button
						on:click={() => {
							if (!selected) return;
							excluded = excluded.concat(selected.wallet);
							selected = null;
						}}><div><EyeSlash size="18" /></div></button
					>
				</div>
				<div>
					<a
						target="_blank"
						rel="noopener noreferrer"
						data-sveltekit-preload-data="off"
						aria-label="Explorer address link"
						href="{data.chain_explorer}token/{data.token.address}?a={selected.wallet}"
						>{selected?.name ?? truncate(selected.wallet, 7)}</a
					>
					<button on:click={() => navigator.clipboard.writeText(selected?.wallet ?? '')}
						><div><Square2Stack size="18" /></div></button
					>
				</div>
				<div>
					Wallet Rank: <span data-kind="small/accent">#{data.holders.indexOf(selected) + 1}</span>
				</div>
				<div>
					Percentage: <span data-kind="small/accent">{formatPercent(selected.percent)}</span>
				</div>
				{#if selected.labels}
					<div>
						Labels: <span data-kind="small/accent">{selected.labels}</span>
					</div>
				{/if}
			</article>
		{/if}

		<article class="Actions">
			{#if !$open}
				<button on:click={() => open.set(true)} in:fade={{ delay: 250, duration: 100 }}>
					<div>
						<ListBullet size="18" /><span>Wallet List</span>
					</div>
				</button>
			{/if}
		</article>

		{#if height && width}
			<Graph
				holders={data.holders.filter((h) => !excluded.includes(h.wallet))}
				transfers={data.transfers.filter(
					(t) => !excluded.includes(t.source) && !excluded.includes(t.target)
				)}
				{height}
				{width}
				bind:selected
			/>
		{/if}
	</section>

	{#if $open}
		<div class="SideBar" transition:slide={{ duration: 250, axis: 'x' }}>
			<h3 data-kind="headline/h3">
				<span>Wallet list</span>
				<button on:click={() => open.set(false)}><div><XMark size="18" /></div></button>
			</h3>
			<ul>
				{#each data.holders as holder, i}
					<li class:Selected={selected === holder} class:Hidden={excluded.includes(holder.wallet)}>
						<button
							on:click={() => {
								if (excluded.includes(holder.wallet)) return;
								selected = holder;
							}}
						>
							<section data-kind="small/regular">
								<span data-kind="small/accent">#{i + 1}</span> - {holder.name ??
									truncate(holder.wallet)}
							</section>
							<span data-kind="small/accent">{formatPercent(holder.percent)}</span>
						</button>
						<button
							on:click={() => {
								if (excluded.includes(holder.wallet))
									excluded = excluded.filter((w) => w !== holder.wallet);
								else {
									excluded = excluded.concat(holder.wallet);
									if (selected === holder) selected = null;
								}
							}}
						>
							<div>
								{#if excluded.includes(holder.wallet)}
									<Eye size="18" />
								{:else}
									<EyeSlash size="18" />
								{/if}
							</div>
						</button>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>

<style>
	.PageContainer {
		--item-background-color: hsl(270deg 14% 12%);
		--header-height: 64px;
		--side-bar-width: 300px;

		width: 100%;
		height: 100%;
		overflow: hidden;
	}

	header {
		height: var(--header-height);
		width: 100%;
		background-color: var(--item-background-color);
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

		transition: width 250ms cubic-bezier(0.215, 0.61, 0.355, 1);

		& > article {
			position: absolute;
			background-color: var(--item-background-color);
			border-radius: 8px;

			&.Wallet_Details {
				padding: 12px;
				left: 10px;
				top: 10px;

				& > div:nth-child(1) {
					display: flex;
					align-items: center;
					gap: 12px;
				}

				& > div:nth-child(2) {
					margin-bottom: 5px;
					display: flex;
					align-items: center;
					gap: 8px;
				}
			}

			&.Actions {
				right: 10px;
				top: 10px;

				& > button {
					& > div {
						--lighten-color: hsl(0deg 0% 70% / 38%);

						display: flex;
						align-items: center;
						gap: 6px;

						padding: 0 10px;
						height: 42px;
						cursor: pointer;
						border-radius: 8px;
						opacity: initial;
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
		}

		& a {
			color: hsl(322deg 74% 50%);
		}
	}

	section.SideBarOpened {
		width: calc(100% - var(--side-bar-width));
	}

	.SideBar {
		position: absolute;
		right: 0;
		bottom: 0;
		top: var(--header-height);
		width: var(--side-bar-width);
		background-color: var(--item-background-color);
		overflow: hidden;

		& > h3 {
			display: flex;
			align-items: center;
			padding: 15px;
			justify-content: space-between;
			height: 53px;
		}

		& > ul {
			list-style: none;
			margin: 0;
			padding: 0;

			height: calc(100% - 53px);
			overflow-y: auto;

			& > li {
				display: flex;

				& > button:first-of-type {
					flex: 1;
					text-align: start;
					display: flex;
					justify-content: space-between;
					padding: 10px 15px;
					width: 100%;
					cursor: pointer;
				}

				& > button:not(:first-of-type) {
					padding: 0 15px;
				}

				&:hover {
					background-color: hsl(294deg 14% 27%);
				}

				&.Selected {
					background-color: hsl(322deg 74% 50%);
				}

				&.Hidden {
					opacity: 0.4;
				}
			}
		}
	}

	button {
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
</style>
