<script lang="ts">
	import type { PageData } from './$types';
	import Graph from './Graph.svelte';

	export let data: PageData;
</script>

<Graph holders={data.holders} />
