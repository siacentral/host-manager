import { ipcRenderer } from 'electron';
import log from 'electron-log';

import Store from '@/store';

function onUpdateDownloaded(info) {
	try {
		Store.dispatch('setUpdate', {
			downloaded: true,
			version: info.version
		});
	} catch (ex) {
		log.error('onUpdateDownloaded', ex.message);
	}
}

export function attachUpdateIPC() {
	ipcRenderer.on('updateAvailable', onUpdateDownloaded);
}