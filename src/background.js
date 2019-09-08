'use strict';

import { autoUpdater } from 'electron-updater';
import { app, Menu, Tray, protocol, BrowserWindow, shell, ipcMain, powerSaveBlocker } from 'electron';
import { createProtocol, installVueDevtools } from 'vue-cli-plugin-electron-builder/lib';
import path from 'path';
import log from 'electron-log';
import SiaDaemon from './sia/daemon';

const isDevelopment = !!~process.defaultApp;

if (!app.requestSingleInstanceLock())
	app.quit();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win, tray, powerSaveID, shutdown = false;

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { secure: true, standard: true } }]);

async function createWindow() {
	const opts = {
		width: 1000,
		height: 800,
		minWidth: 800,
		minHeight: 600,
		title: 'Sia Host Manager',
		icon: path.join(__static, 'icon.png'),
		autoHideMenuBar: true,
		backgroundColor: '#1d1e21',
		show: false,
		webPreferences: {
			nodeIntegration: true
		},
		// darwin overrides
		...(process.platform === 'darwin' ? {
			titleBarStyle: 'hiddenInset'
		} : {}),
		// windows overrides
		...(process.platform === 'win32' ? {
			frame: false
		} : {})
	};

	// Create the browser window.
	win = new BrowserWindow(opts);

	if (process.env.WEBPACK_DEV_SERVER_URL) {
		// Load the url of the dev server if in development mode
		win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
		if (!process.env.IS_TEST) win.webContents.openDevTools();
	} else {
		createProtocol('app');
		// Load the index.html when not in development
		win.loadURL('app://./index.html');
	}

	const handleRedirect = (e, url) => {
		if (url.startsWith('http') && url !== win.webContents.getURL()) {
			shell.openExternal(url);

			e.preventDefault();
			return false;
		}
	};

	win.on('close', (e) => {
		if (shutdown)
			return;

		if (process.platform === 'darwin')
			app.dock.hide();

		win.hide();
		e.preventDefault();

		return false;
	});

	win.webContents.on('will-navigate', handleRedirect);
	win.webContents.on('new-window', handleRedirect);

	win.show();
	win.focus();
}

function openWindow() {
	if (!win)
		createWindow();

	if (win.isMinimized())
		win.restore();

	if (process.platform === 'darwin')
		app.dock.show();

	win.show();
	win.focus();
}

async function onExit() {
	shutdown = true;

	if (daemon && daemon.running())
		await daemon.shutdown();

	app.quit();
}

function createTray() {
	const menu = Menu.buildFromTemplate([
		{ label: 'Show Desktop', click: openWindow },
		{ label: 'Exit', click: onExit }
	]);
	tray = new Tray(path.join(__static, 'icons/siacentral_white_16.png'));

	tray.on('double-click', openWindow);

	tray.setContextMenu(menu);
}

app.on('second-instance', openWindow);

// Quit when all windows are closed.
app.on('window-all-closed', (e) => {
	e.preventDefault();
	return false;
});

app.on('activate', openWindow);

app.on('will-quit', async() => {
	if (daemon && daemon.running())
		daemon.shutdown();

	powerSaveBlocker.stop(powerSaveID);
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async() => {
	if (isDevelopment && !process.env.IS_TEST) {
		// Install Vue Devtools
		try {
			await installVueDevtools();
		} catch (e) {
			log.error('Vue Devtools failed to install:', e.toString());
		}
	}

	openWindow();
	createTray();

	powerSaveID = powerSaveBlocker.start('prevent-app-suspension');
});

app.on('ready', () => {
	log.info('checking for updates');
	autoUpdater.checkForUpdatesAndNotify();
});

autoUpdater.on('update-available', info => {
	log.info('Update Available', info);
});

autoUpdater.on('download-progress', progress => {
	log.info('Update Download', progress);
});

autoUpdater.on('update-downloaded', info => {
	log.info('Downloaded', info);
});

autoUpdater.on('error', (err) => {
	log.info('Update Error', err);
});

ipcMain.on('show-window', () => {
	openWindow();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
	if (process.platform === 'win32') {
		process.on('message', data => {
			if (data === 'graceful-exit')
				app.quit();
		});
	} else {
		process.on('SIGTERM', () => {
			app.quit();
		});
	}
}

// TEMP MOVE LATER

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

ipcMain.on('launchDaemon', async(ev, config) => {
	try {
		if (shutdown)
			return;

		const running = daemon && (await daemon.available());

		if (running)
			return;

		if (!daemon) {
			daemon = new SiaDaemon({
				...config,
				siad_path: getPath()
			});

			daemon.on('stdout', (stats) => {
				win.webContents.send('daemonUpdate', stats);
			});

			daemon.on('loaded', (stats) => {
				log.info(`daemon loaded after ${Math.floor((Date.now() - stats.start) / 1000)} seconds`);
				win.webContents.send('daemonLoaded', stats);
			});

			daemon.on('exit', (code, stats) => {
				log.info(`daemon exited after ${Math.floor((Date.now() - stats.start) / 1000)} seconds with exit code ${code}`);

				if (stats.stderr && stats.stderr.trim().length > 0)
					log.error('daemon stderr', stats.stderr);

				win.webContents.send('daemonExit', code, stats);
			});

			daemon.on('error', (ex) => {
				win.webContents.send('daemonError', ex);
			});
		}

		await daemon.start();
	} catch (ex) {
		log.error('startDaemon', ex.message);
	}
});