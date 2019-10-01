import { app, Menu, Tray } from 'electron';
import { promises as fs } from 'fs';
import path from 'path';
import log from 'electron-log';
import { decode } from '@stablelib/utf8';
import SiaApiClient from '../sia/api';
import { openWindow, sendIPC } from './window';
import { shutdownDaemon, running } from './daemon';

export var mainTray;
export var shutdown = false;

export function setShutdown(val) {
	shutdown = val;
}

export async function createTray() {
	if (!mainTray)
		mainTray = new Tray(path.join(__static, 'icons/siacentral_white_16.png'));

	const menuTemplate = [
		{ label: 'Show Desktop', click: openWindow }
	];

	if (await running())
		menuTemplate.push({ label: 'Restart Daemon', click: onRestart });

	menuTemplate.push({ label: 'Exit', click: onExit });
	mainTray.on('double-click', openWindow);
	mainTray.setContextMenu(Menu.buildFromTemplate(menuTemplate));
}

async function onExit() {
	try {
		sendIPC('statusUpdate', 'shutdown');
		shutdown = true;

		await shutdownDaemon();
	} catch (ex) {
		log.error('onExit', ex.message);
	} finally {
		app.quit();
	}
}

async function onRestart() {
	try {
		sendIPC('statusUpdate', 'restart');

		const buf = await fs.readFile(path.join(app.getPath('userData'), 'config.json')),
			config = JSON.parse(decode(buf)),
			client = new SiaApiClient(config),
			resp = await client.stopDaemon();

		if (resp.statusCode !== 200)
			throw new Error(resp.body.error || 'unknown error');
	} catch (ex) {
		log.error('daemon restart', ex.message);
		sendIPC('statusUpdate', null);
	}
}