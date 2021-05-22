module.exports = {

	root: true,
	extends: [ '@brooswajne' ],

	overrides: [ {
		files: [ '**/*.ts' ],
		extends: [ '@brooswajne/eslint-config/overrides/typescript' ],
	} ],

};
