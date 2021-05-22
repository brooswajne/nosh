<script>
import {
	autoReconnectDelay,
	isConnected,
} from '../utils/socket.js';

const SECOND_IN_MS = 1000;
const MIN_IN_MS = 60 * SECOND_IN_MS;

// TODO: abstract to util file and make a lot better
/** @param {number} ms */
function getTimeString(ms) {
	const s = ms / 1000;
	if (s < 1) return `${ms}ms`;
	const min = s / 60;
	if (min < 1) return `${Math.floor(s)}s`;
	else return `${Math.floor(min)}m${Math.floor(s % 60)}s`;
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
