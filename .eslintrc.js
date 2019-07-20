// https://eslint.org/docs/user-guide/configuring

module.exports = {
	root: true,
	parserOptions: {
		parser: 'babel-eslint'
	},
	env: {
		browser: true
	},
	extends: [
		'plugin:vue/essential',
		'standard'
	],
	// required to lint *.vue files
	plugins: [
		'vue'
	],
	// add your custom rules here
	rules: {
		// allow async-await
		'generator-star-spacing': 'off',
		'no-tabs': 'off',
		'indent': ['error', 'tab'],
		'space-before-function-paren': ['error', 'never'],
		'semi': ['error', 'always'],
		'eol-last': 'off',
		// allow debugger during development
		'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
		'one-var': 'off',
		'curly': ['error', 'multi-or-nest']
	}
};
