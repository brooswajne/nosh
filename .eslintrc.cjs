module.exports = {
	root: true,
	extends: [ '@brooswajne' ],

	overrides: [ {
		files: [ '**/*.svelte' ],
		extends: [ '@brooswajne/eslint-config/svelte' ],
	}, {
		files: [ 'src/**/*', 'client/**/*' ],
		extends: [ '@brooswajne/eslint-config/browser' ],
	} ],
};
