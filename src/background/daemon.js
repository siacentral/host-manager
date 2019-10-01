import { app, ipcMain } from 'electron';
import log from 'electron-log';
import path from 'path';
import { sendIPC } from './window';
import { createTray, shutdown } from './tray';
import SiaDaemon from '../sia/daemon';

let daemon;

function getPath() {
	const binary = process.platform === 'win32' ? 'siad.exe' : 'siad';

	if (!app.isPackaged) {
		let platform = process.platform;

		if (platform === 'win32')
			platform = 'win';
		else if (platform === 'darwin')
			platform = 'mac';

		return path.join(__static, '..', 'build', 'bin', platform, binary);
	}

	return path.join(process.resourcesPath, 'bin', binary);
}

export function running() {
	if (!daemon)
		return false;

	return daemon.available();
}

async function onLaunchDaemon(ev, config) {
	try {
		if (shutdown || await running())
			return;

		if (!daemon) {
			daemon = new SiaDaemon({
				...config,
				siad_path: getPath()
			});

			daemon.on('stdout', (stats) => {
				sendIPC('daemonUpdate', stats);
			});

			daemon.on('loaded', (stats) => {
				log.info(`daemon loaded after ${Math.floor((Date.now() - stats.start) / 1000)} seconds`);
				sendIPC('daemonLoaded', stats);
				createTray();
			});

			daemon.on('exit', (code, stats) => {
				const runtime = Math.floor((Date.now() - stats.start) / 1000);

				if (runtime < 10)
					sendIPC('daemonError', -1, stats);

				log.info(`daemon exited after ${runtime} seconds with exit code ${code}`);

				if (stats.stderr && stats.stderr.trim().length > 0)
					log.error('daemon stderr', stats.stderr);

				sendIPC('daemonExit', code, stats);
			});

			daemon.on('error', (ex) => {
				sendIPC('daemonError', ex);
			});
		}

		await daemon.start();
	} catch (ex) {
		log.error('startDaemon', ex.message);
	}
}

export function shutdownDaemon() {
	if (!daemon || !daemon.running())
		return;

	return daemon.shutdown();
}

export function attachDaemonIPC() {
	ipcMain.on('launchDaemon', onLaunchDaemon);
}