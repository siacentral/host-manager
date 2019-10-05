import { ipcRenderer } from 'electron';
import log from 'electron-log';

import Store from '@/store';

function onUpdateDownloaded(ev, info) {
	try {
		Store.dispatch('setUpdate', {
			...info,
			releaseDate: new Date(info.releaseDate)
		});
	} catch (ex) {
		log.error('onUpdateDownloaded', ex.message);
	}
}

function onUpdateProgress(ev, progress) {
	try {
		Store.dispatch('setUpdateProgress', {
			percent: progress.percent,
			speed: progress.bytesPerSecond
		});
	} catch (ex) {
		log.error('onUpdateProgress', ex.message);
	}
}

export function attachUpdateIPC() {
	ipcRenderer.on('updateData', onUpdateDownloaded);
	ipcRenderer.on('updateDownloadProgress', onUpdateProgress);
}

export function checkForUpdates() {
	ipcRenderer.send('checkUpdates');
}