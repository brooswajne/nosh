import { connect } from '../client/socket.js';
import App from '../components/app.svelte';

const splash = document.getElementById('splash');
const target = document.getElementById('app');
if (splash == null) throw new Error('Splash element not found');
if (target == null) throw new Error('Root element not found');

connect( ).then(function onceConnected( ) {
	const app = new App({ target }); // eslint-disable-line no-unused-vars
	document.body.setAttribute('data-state', 'connected');
}).catch(function handleError(err) {
	console.error('Unexpected error connecting:', err);
});
