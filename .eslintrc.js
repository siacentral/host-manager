module.exports = {
	root: true,
	env: {
		node: true
	},
	extends: [
		'plugin:vue/vue3-essential',
		'@vue/standard'
	],
	parserOptions: {
		parser: 'babel-eslint'
	},
	rules: {
		// allow async-await
		'no-sequences': 'off',
		'generator-star-spacing': 'off',
		'no-tabs': 'off',
		indent: ['error', 'tab'],
		'space-before-function-paren': ['error', 'never'],
		semi: ['error', 'always'],
		'eol-last': 'off',
		// allow debugger during development
		'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
		'one-var': 'off',
		curly: ['error', 'multi-or-nest'],
		'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off'
	}
};
