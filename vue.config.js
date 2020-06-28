const path = require('path');

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
			nodeIntegration: true,
			builderOptions: {
				appId: 'com.siacentral.host-desktop',
				productName: 'Sia Host Manager',
				copyright: '2019 Sia Central',
				afterSign: 'build/scripts/notarize.js',
				afterAllArtifactBuild: 'build/scripts/sign.js',
				/* eslint-disable no-template-curly-in-string */
				artifactName: '${productName}-v${version}.${ext}',
				extraResources: [
					{
						/* eslint-disable no-template-curly-in-string */
						from: 'build/bin/${os}',
						to: 'bin',
						filter: [
							'**/*'
						]
					}
				],
				mac: {
					/* eslint-disable no-template-curly-in-string */
					artifactName: '${productName}-v${version}.${ext}',
					hardenedRuntime: true,
					// disabled due to new Apple notarization failing
					gatekeeperAssess: false,
					entitlements: 'build/entitlements.mac.plist',
					entitlementsInherit: 'build/entitlements.mac.plist'
				},
				linux: {
					executableName: 'Sia Host Manager',
					/* eslint-disable no-template-curly-in-string */
					artifactName: '${productName}-v${version}.${ext}',
					target: [
						'deb',
						'AppImage'
					],
					category: 'Utility'
				},
				appImage: {
					/* eslint-disable no-template-curly-in-string */
					artifactName: '${productName}-v${version}.${ext}'
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
					provider: 'generic',
					/* eslint-disable no-template-curly-in-string */
					url: 'https://public.siacentral.com/host-manager/releases/${channel}',
					channel: 'latest'
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