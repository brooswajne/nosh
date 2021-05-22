module.exports = {

	overrides: [ {
		files: [ './utils/**/*', './assets/**/*', './components/**/*' ],
		extends: [ '@brooswajne/eslint-config/overrides/browser' ],
	}, {
		files: [ '*.svelte' ],
		extends: [ '@brooswajne/eslint-config/overrides/svelte' ],
	} ],

};
