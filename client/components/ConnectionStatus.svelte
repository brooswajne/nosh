<script lang="ts">
import {
	autoReconnectDelay,
	isConnected,
} from '../utils/socket.js';

const SECOND_IN_MS = 1000;
const MIN_IN_SECONDS = 60;

// TODO: abstract to util file and make a lot better
function getTimeString(ms: number) {
	const s = ms / SECOND_IN_MS;
	if (s < 1) return `${ms}ms`;
	const min = s / MIN_IN_SECONDS;
	if (min < 1) return `${Math.floor(s)}s`;
	return `${Math.floor(min)}m${Math.floor(s % MIN_IN_SECONDS)}s`;
}
</script>

<div class="container" class:is-connected={$isConnected}>
	<div class="status">
		{#if $isConnected}
			<i class="fas fa-circle"></i>
			<span class="label">Connected</span>
		{:else}
			<i class="fas fa-circle-notch fa-spin"></i>
			<span class="label">Disconnected</span>
		{/if}
	</div>
	<div class="timer">
		Reconnecting in <strong>{getTimeString($autoReconnectDelay)}</strong>...
	</div>
</div>

<style>
.container {
	display: grid;
	grid-template-rows: 1fr auto;
	padding: 0 2rem;
}

.status {
	margin: auto;
	z-index: 1;
}

.status i { 
	transition: color var(--transition-duration-normal);
	margin-right: 0.3rem;
}
.container:not(.is-connected) 
.status i { color: var(--color-red) }
.container.is-connected 
.status i { color: var(--color-green) }

.timer {
	transition: 
		opacity var(--transition-duration-normal),
		margin var(--transition-duration-normal);
	opacity: 0.5;
	margin-top: 0.3rem;
}
.container.is-connected
.timer {
	opacity: 0;
	margin-top: -1.5em;
}
</style>
