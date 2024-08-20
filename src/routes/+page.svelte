<script lang="ts">
	import { goto } from '$app/navigation';
	import { isValidAddress } from '$lib/utils/address';

	function handleSubmit(e: SubmitEvent & { currentTarget: HTMLFormElement }) {
		const form = new FormData(e.currentTarget);

		const address = form.get('address');

		if (typeof address === 'string' && isValidAddress(address)) {
			goto(`/ethereum/${address}`);
		}
	}
</script>

<h1 data-kind="headline/h1">Welcome to TokenFlow by Agnostic</h1>

<form on:submit|preventDefault={handleSubmit} autocomplete="off">
	<h2 data-kind="headline/h3">Search for token</h2>

	<div>
		<label for="address" data-kind="label/accent">Token Address: </label>
		<input
			required
			type="text"
			name="address"
			id="address"
			placeholder="0xa0b869..."
			data-1p-ignore
		/>
	</div>

	<button>
		<div>Submit</div>
	</button>
</form>

<style>
	h1 {
		text-align: center;
	}

	form {
		max-width: 480px;
		margin: 24px auto;

		padding: 20px;
		border-radius: 12px;

		background-color: hsl(0deg 0% 100% / 100%);
		color: hsl(0deg 0% 13% / 100%);

		display: grid;
		gap: 20px;
		grid-template-columns: minmax(0px, auto);

		& > h2 {
			text-align: center;
		}

		& > div {
			& > label {
				display: block;
				margin-bottom: 4px;
			}

			& > input[type='text'] {
				display: block;
				width: 100%;
				height: 42px;
				padding: 0 12px;
				border-radius: 8px;
				border: 1px solid hsl(0deg 0% 0% / 10%);
				outline: none;
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
			}

			&:not(:disabled):active > div {
				background-image: linear-gradient(to right, var(--lighten-color), var(--lighten-color));
			}
		}
	}
</style>
