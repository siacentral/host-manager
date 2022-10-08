'use strict';

import { app, crashReporter, protocol, ipcMain, powerSaveBlocker } from 'electron';
import log from 'electron-log';
import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer';

import { createTray } from './background/tray';
import { openWindow } from './background/window';
import { shutdownDaemon } from './background/daemon';
import { attachIPC } from './background/ipc';
const isDevelopment = process.env.NODE_ENV !== 'production';

crashReporter.start({
	submitURL: 'https://crash.siacentral.com',
	uploadToServer: false
});

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let powerSaveID;

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
	{ scheme: 'app', privileges: { secure: true, standard: true } }
]);

if (!app.requestSingleInstanceLock())
	app.quit();

app.on('second-instance', openWindow);
app.on('activate', openWindow);
app.on('window-all-closed', e => {
	e.preventDefault();
	return false;
});
app.on('will-quit', async() => {
	await shutdownDaemon();
	powerSaveBlocker.stop(powerSaveID);
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async() => {
	if (isDevelopment && !process.env.IS_TEST) {
		// Install Vue Devtools
		try {
			await installExtension(VUEJS3_DEVTOOLS);
		} catch (e) {
			log.error('Vue Devtools failed to install:', e.toString());
		}
	}

	attachIPC();
	await openWindow();
	await createTray();
});

ipcMain.on('show-window', openWindow);

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
	if (process.platform === 'win32') {
		process.on('message', (data) => {
			if (data === 'graceful-exit')
				app.quit();
		});
	} else {
		process.on('SIGTERM', () => {
			app.quit();
		});
	}
}
