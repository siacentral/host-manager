const { notarize } = require('electron-notarize');

module.exports = function notarizing(context) {
	const { electronPlatformName, appOutDir } = context;

	if (electronPlatformName !== 'darwin')
		return;

	const appName = context.packager.appInfo.productFilename;

	return notarize({
		appBundleId: 'com.siacentral.desktop',
		appPath: `${appOutDir}/${appName}.app`,
		appleApiKey: process.env.APPLE_API_KEY,
		appleApiIssuer: process.env.APPLE_API_ISSUER
	});
};