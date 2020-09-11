'use strict';

import { app, protocol, ipcMain, powerSaveBlocker } from 'electron';
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer';
import log from 'electron-log';
import { createTray } from './background/tray';
import { openWindow } from './background/window';
import { attachDaemonIPC, shutdownDaemon } from './background/daemon';
import { attachUpdateIPC } from './background/autoupdate';

const isDevelopment = !!~process.defaultApp;

if (!app.requestSingleInstanceLock())
	app.quit();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let powerSaveID;

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { secure: true, standard: true } }]);

app.on('second-instance', openWindow);

// Quit when all windows are closed.
app.on('window-all-closed', (e) => {
	e.preventDefault();
	return false;
});

app.on('activate', openWindow);

app.on('will-quit', async() => {
	await shutdownDaemon();

	powerSaveBlocker.stop(powerSaveID);
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async() => {
	if (isDevelopment && !process.env.IS_TEST) {
		// Install Vue Devtools
		try {
			await installExtension(VUEJS_DEVTOOLS);
		} catch (e) {
			log.error('Vue Devtools failed to install:', e.toString());
		}
	}

	attachDaemonIPC();
	attachUpdateIPC();
	openWindow();
	await createTray();

	powerSaveID = powerSaveBlocker.start('prevent-app-suspension');
});

ipcMain.on('show-window', openWindow);

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
