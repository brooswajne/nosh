<script>
import Header from './header.svelte';
</script>

<div class="container">
	<Header />

	<main>App!</main>
</div>

<style>
.container {
	display: grid;
	grid-template-rows: auto minmax(0, 1fr);
}

main {
	display: flex;
	justify-content: center;
	align-items: center;
}
</style>
