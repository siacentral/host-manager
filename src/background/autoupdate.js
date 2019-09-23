import { app, ipcMain } from 'electron';
import log from 'electron-log';
import { autoUpdater } from 'electron-updater';
import { setShutdown } from './tray';
import { sendIPC } from './window';
import { shutdownDaemon } from './daemon';

export function startUpdateCheck() {
	if (!app.isPackaged)
		return;

	ipcMain.on('installUpdate', onInstallUpdate);

	autoUpdater.on('update-downloaded', onUpdateDownloaded);
	autoUpdater.on('error', onUpdateError);
	checkForUpdates();
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

function checkForUpdates() {
	autoUpdater.checkForUpdates();

	setTimeout(checkForUpdates, 14400000);
}

function onUpdateDownloaded(info) {
	sendIPC('updateAvailable', info);
}

function onUpdateError(err) {
	log.error('update error', err);
}