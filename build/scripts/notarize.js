const { notarize } = require('electron-notarize');

module.exports = function notarizing(context) {
	const { electronPlatformName, appOutDir } = context;

	if (electronPlatformName !== 'darwin')
		return;

	const appName = context.packager.appInfo.productFilename;

	return notarize({
		appBundleId: 'com.siacentral.desktop',
		appPath: `${appOutDir}/${appName}.app`,
		appleId: process.env.APPLE_ID,
		appleIdPassword: `@keychain:Application Loader: ${process.env.APPLE_ID}`
	});
};