import { ipcRenderer } from 'electron';
import log from 'electron-log';

import SiaApiClient from '@/sia/api';
import Store from '@/store';
import { refreshData } from './index';
import { sleep } from '@/utils';

function onDaemonUpdate(ev, stats) {
	const loadDenom = stats.modules && stats.modules.total ? stats.modules.total + 1 : 1,
		loadNum = stats.modules && stats.modules.loaded ? stats.modules.loaded : 0;

	Store.dispatch('hostDaemon/setManaged', true);
	Store.dispatch('hostDaemon/setLoadPercent', loadNum / loadDenom);
	Store.dispatch('hostDaemon/setCurrentModule', stats.modules.module);
}

async function onDaemonLoaded(ev, stats) {
	try {
		await refreshData();
		await sleep(1);

		Store.dispatch('hostDaemon/setLoaded', stats.loaded);
		Store.dispatch('setCriticalError', null);
		Store.dispatch('hostDaemon/setStatus', null);
	} catch (ex) {
		log.error('onDaemonLoaded', ex.message);
	}
}

function onDaemonCritical(ev, code, stats) {
	try {
		const runtime = Math.floor((Date.now() - stats.start) / 1000);

		Store.dispatch('setCriticalError', `Daemon crashed in ${runtime} seconds. Unable to start Sia. Please check logs for more information`);
	} catch (ex) {
		log.error('onDaemonCritical', ex.message);
	}
}

export function attachDaemonIPC() {
	ipcRenderer.on('daemonUpdate', onDaemonUpdate);
	ipcRenderer.on('daemonLoaded', onDaemonLoaded);
	ipcRenderer.on('daemonError', onDaemonCritical);
}

export function launch() {
	ipcRenderer.send('launchDaemon', Store.state.config);
}

export async function running() {
	try {
		const client = new SiaApiClient(Store.state.config);

		await client.getDaemonVersion();

		return true;
	} catch (ex) {
		log.error('daemon running', ex.message);
	}

	return false;
}