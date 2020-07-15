module.exports = {
	presets: [
		['@vue/cli-plugin-babel/preset',
			{
				exclude: ['@babel/plugin-transform-async-to-generator', '@babel/plugin-transform-regenerator']
			}
		]
	],
	plugins: [
		['@babel/plugin-transform-runtime', {
			regenerator: false
		}],
		['@babel/plugin-transform-regenerator', {
			asyncGenerators: false,
			generators: false,
			async: false
		}]
	]
};
