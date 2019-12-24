import { app, ipcMain } from 'electron';
import log from 'electron-log';
import { autoUpdater } from 'electron-updater';
import { setShutdown } from './tray';
import { sendIPC } from './window';
import { shutdownDaemon } from './daemon';

let updateTimeout, checkingForUpdates = false;

export function attachUpdateIPC() {
	ipcMain.on('installUpdate', onInstallUpdate);
	ipcMain.on('checkUpdates', onCheckForUpdates);

	autoUpdater.on('update-available', onUpdateAvailable);
	autoUpdater.on('download-progress', onUpdateProgress);
	autoUpdater.on('update-downloaded', onUpdateReady);
	autoUpdater.on('error', onUpdateError);
}

async function onInstallUpdate() {
	try {
		setShutdown(true);
		await shutdownDaemon();

		if (app.isPackaged)
			autoUpdater.quitAndInstall(true, true);
		else
			app.quit();
	} catch (ex) {
		log.error('onInstallUpdate', ex.message);
	}
}

function onCheckForUpdates() {
	if (!app.isPackaged || checkingForUpdates)
		return;

	try {
		checkingForUpdates = true;

		clearTimeout(updateTimeout);
		autoUpdater.checkForUpdates();
	} catch (ex) {
		log.error('onCheckForUpdates', ex.message);
	} finally {
		checkingForUpdates = false;
		updateTimeout = setTimeout(onCheckForUpdates, 14400000);
	}
}

function onUpdateAvailable(info) {
	try {
		sendIPC('updateData', {
			version: info.version,
			releaseDate: info.releaseDate,
			available: true,
			ready: false
		});
	} catch (ex) {
		log.error('onUpdateAvailable', ex);
	}
}

function onUpdateReady(info) {
	try {
		log.info(`update ${info.version} downloaded and waiting to install`);
		sendIPC('updateData', {
			version: info.version,
			releaseDate: info.releaseDate,
			available: true,
			ready: true
		});
	} catch (ex) {
		log.error('onUpdateReady', ex);
	}
}

function onUpdateProgress(progress) {
	try {
		sendIPC('updateDownloadProgress', progress);
	} catch (ex) {
		log.error('onUpdateProgress', ex);
	}
}

function onUpdateError(err) {
	try {
		log.error('update error', err);
	} catch (ex) {
		log.error('onUpdateError', ex);
	}
}