<script lang="ts">
	import SkipLink from '$lib/components/SkipLink.svelte';
	import '$lib/styles/index.css';
</script>

<SkipLink href="#root" />

<div class="PageWrapper">
	<slot />
</div>

<style>
	.PageWrapper {
		width: 100%;
		max-width: 960px;
		margin: 0 auto;
		padding: 24px 15px;
	}
</style>
