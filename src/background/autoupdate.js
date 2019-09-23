import { app } from 'electron';
import log from 'electron-log';
import { sendIPC } from './window';
import { autoUpdater } from 'electron-updater';

export function startUpdateCheck() {
	if (!app.isPackaged)
		return;

	autoUpdater.on('update-downloaded', onUpdateDownloaded);
	autoUpdater.on('error', onUpdateError);
	checkForUpdates();
}

function checkForUpdates() {
	autoUpdater.checkForUpdatesAndNotify();

	setTimeout(checkForUpdates, 14400000);
}

function onUpdateDownloaded(info) {
	log.info('downloaded', info);
	sendIPC('updateAvailable', info);
}

function onUpdateError(err) {
	log.error('update error', err);
}