<script lang="ts">
	import { goto } from '$app/navigation';
	import Logo from '$lib/components/components/Logo.svelte';
	import { isValidAddress } from '$lib/utils/address';
	import type { PageData } from './$types';

	let loading = false;
	function handleSubmit(e: SubmitEvent & { currentTarget: HTMLFormElement }) {
		const form = new FormData(e.currentTarget);

		const address = form.get('address');

		if (typeof address === 'string' && isValidAddress(address)) {
			loading = true;
			goto(`/ethereum/${address}`);
		}
	}

	export let data: PageData;
</script>

<svelte:head>
	<title>TokenFlow by Agnostic</title>
</svelte:head>

<h1 data-kind="headline/h3">
	<Logo />
	TokenFlow
</h1>

<form on:submit|preventDefault={handleSubmit} autocomplete="off">
	<div>
		<label for="address" data-kind="label/accent">Token Address: </label>
		<input
			required
			type="text"
			name="address"
			id="address"
			placeholder="0xa0b869..."
			data-1p-ignore
			disabled={loading}
		/>
	</div>
</form>

<section>
	{#each data.tokens as token (token.address)}
		<a href="/ethereum/{token.address}">
			<article>
				<img src={token.logoURI} alt="{token.symbol} 's logo" />
				<span data-kind="body/accent">{token.name}</span>
			</article>
		</a>
	{/each}
</section>

<style>
	h1 {
		display: flex;
		align-items: center;
		gap: 12px;
		height: 64px;

		padding: 0 64px;
		background-color: hsl(270deg 14% 12%);

		@media screen and (max-width: 768px) {
			padding: 0 32px;
		}

		@media screen and (max-width: 576px) {
			padding: 0 16px;
		}
	}

	form {
		max-width: 400px;
		margin: 24px auto;

		display: grid;
		gap: 20px;
		grid-template-columns: minmax(0px, auto);

		& > div {
			& > label {
				display: block;
				margin-bottom: 12px;
				user-select: none;
			}

			& > input[type='text'] {
				display: block;
				width: 100%;
				height: 42px;
				padding: 0 12px;
				border-radius: 8px;
				border: none;
				outline: none;
				background-color: hsl(0deg 0% 100% / 10%);
				color: inherit;
			}
		}

		& > button {
			& > div {
				--lighten-color: hsl(0deg 0% 70% / 38%);

				display: grid;
				place-items: center;

				border-radius: 8px;
				padding: 0 10px;
				height: 42px;
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

	section {
		width: 100%;
		max-width: 56rem;

		margin: 3rem auto;
		padding: 0 24px;

		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
		gap: 24px;

		& > a {
			text-decoration: none;

			& > article {
				width: 100%;

				height: 170px;
				border-radius: 20px;
				border: 1px solid rgba(96, 122, 227, 0.2);

				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
				gap: 12px;
				background-color: hsl(270deg 14% 12%);

				& > img {
					aspect-ratio: 1 / 1;
					width: 70px;
				}
			}

			&:hover > article {
				& > span,
				& > img {
					transform: translateY(-6px);
				}
			}
		}
	}
</style>
