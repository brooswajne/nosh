import App from '../components/app.svelte';
import { connect } from '../utils/socket.js';

const splash = document.getElementById('splash');
const target = document.getElementById('app');
if (splash == null) throw new Error('Splash element not found');
if (target == null) throw new Error('Root element not found');

connect( ).then(function onceConnected( ) {
	// eslint-disable-next-line no-new -- it's just how svelte works
	new App({ target });
	document.body.setAttribute('data-state', 'connected');
}).catch(function handleError(err) {
	console.error('Unexpected error connecting:', err);
});
