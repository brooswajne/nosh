<script>
import { isConnected } from '../utils/socket.js';

import ConnectionStatus from './ConnectionStatus.svelte';
import NightModeToggle from './NightModeToggle.svelte';
</script>

<header data-state={$isConnected ? 'connected' : 'disconnected'}>
	<h1>nosh.</h1>
	<ConnectionStatus />
	<NightModeToggle />
</header>

<style>
header {
	padding: 1rem 2rem;
	display: grid;
	grid-template-columns: 1fr auto auto;
	align-items: center;

	border-bottom: 2px solid var(--color-accent-coral);
	transition: border-color var(--transition-duration-normal);
}
header[data-state="connected"] {
	border-color: var(--color-primary);
}

h1 { margin: 0 }
</style>
