<!--@component
Accessibility helper component to skip to the main content
-->
<script lang="ts">
	export let href: string;
</script>

<a {href}> <slot>Skip to main content</slot> </a>

<style>
	a {
		background: hsl(0deg 0% 100%);
		color: hsl(0deg 0% 27%);
		border: 2px solid hsl(0deg 0% 13%);
		padding: 8px;
		position: absolute;
		inset-block-start: 0;
		inset-inline-start: 0;
		transform: translateY(-999px);
		z-index: 1000; /* 1 more than the banner z-index */
	}

	a:focus {
		transform: translateY(0%);
	}
</style>
