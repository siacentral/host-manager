const path = require('path');

module.exports = {
	parallel: false,
	chainWebpack: config => {
		config.output.publicPath = `${process.cwd()}/dist/`;

		const types = ['vue-modules', 'vue', 'normal-modules', 'normal'];
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
				artifactName: '${productName}-v${version}-${os}-${arch}.${ext}',
				extraResources: [
					{
						/* eslint-disable no-template-curly-in-string */
						from: 'build/bin/${os}/${arch}',
						to: 'bin',
						filter: [
							'**/*'
						]
					}
				],
				win: {
					/* eslint-disable no-template-curly-in-string */
					artifactName: '${productName}-v${version}-${os}-${arch}.${ext}'
				},
				mac: {
					/* eslint-disable no-template-curly-in-string */
					artifactName: '${productName}-v${version}-${os}-${arch}.${ext}',
					hardenedRuntime: true,
					// disabled due to new Apple notarization failing
					gatekeeperAssess: false,
					entitlements: 'build/entitlements.mac.plist',
					entitlementsInherit: 'build/entitlements.mac.plist'
				},
				linux: {
					executableName: 'Sia Host Manager',
					/* eslint-disable no-template-curly-in-string */
					artifactName: '${productName}-v${version}-${os}-${arch}.${ext}',
					target: [
						'deb',
						'AppImage'
					],
					category: 'Utility'
				},
				appImage: {
					/* eslint-disable no-template-curly-in-string */
					artifactName: '${productName}-v${version}-${os}-${arch}.${ext}'
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
					bucket: 'siacentral',
					endpoint: 'https://s3.filebase.com',
					path: '/releases/host-manager'
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