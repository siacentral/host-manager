const path = require('path');

if (process.env.API_ENV === 'local')
	process.env.VUE_APP_API_BASE_URL = 'http://localhost:8081/api/v1';
else
	process.env.VUE_APP_API_BASE_URL = 'https://api.siacentral.com/api/v1';

module.exports = {
	parallel: false,
	chainWebpack: config => {
		config.output.publicPath = `${process.cwd()}/dist/`;

		const svgRule = config.module.rule('svg'),
			types = ['vue-modules', 'vue', 'normal-modules', 'normal'];

		svgRule.uses.clear();
		svgRule
			.use('vue-svg-loader')
			.loader('vue-svg-loader')
			.options({
				svgo: false
			});

		types.forEach(type => addStyleResource(config.module.rule('stylus').oneOf(type)));
	},
	pluginOptions: {
		electronBuilder: {
			outputDir: 'dist',
			builderOptions: {
				appId: 'com.siacentral.desktop',
				productName: 'Sia Central Desktop',
				copyright: '2019 Sia Central',
				afterSign: 'build/scripts/notarize.js',
				extraResources: [
					{
						/* eslint-disable no-template-curly-in-string */
						from: 'build/bin/${platform}',
						to: 'bin',
						filter: [
							'**/*'
						]
					}
				],
				mac: {
					hardenedRuntime: true,
					// disabled due to new Apple notarization failing
					gatekeeperAssess: false,
					entitlements: 'build/entitlements.mac.plist',
					entitlementsInherit: 'build/entitlements.mac.plist'
				},
				dmg: {
					// new apple notarization does not need the dmg signed
					sign: false
				},
				nsis: {
					oneClick: true,
					perMachine: true
				},
				publish: {
					provider: 's3',
					bucket: 'siacentral-public',
					region: 'us-east-2',
					acl: 'public-read'
				}
			}
		}
	}
};

function addStyleResource(rule) {
	rule.use('style-resource')
		.loader('style-resources-loader')
		.options({
			patterns: [
				path.resolve(__dirname, './src/styles/vars.styl')
			]
		});
}