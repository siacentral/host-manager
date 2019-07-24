/**
 * Cannot notarize app until after this issue is fixed. Included siad binary is not compatible with new apple notarization
 * https://github.com/golang/go/issues/30488
 */
import { notarize } from 'electron-notarize';

export default function notarizing(context) {
	const { electronPlatformName, appOutDir } = context;

	if (electronPlatformName !== 'darwin')
		return;

	const appName = context.packager.appInfo.productFilename;

	return notarize({
		appBundleId: 'com.siacentral.desktop',
		appPath: `${appOutDir}/${appName}.app`,
		appleId: process.env.APPLE_ID,
		appleIdPassword: `@keychain:Application Loader: me@n8m.us`
	});
};