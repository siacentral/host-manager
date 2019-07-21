'use strict';

import { app, Tray, protocol, BrowserWindow, shell } from 'electron';
import { createProtocol, installVueDevtools } from 'vue-cli-plugin-electron-builder/lib';
import path from 'path';

const isDevelopment = process.env.NODE_ENV !== 'production';

if (!app.requestSingleInstanceLock())
	app.quit();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win, tray;

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { secure: true, standard: true } }]);

function createWindow() {
	// Create the browser window.
	win = new BrowserWindow({
		width: 1000,
		height: 800,
		minWidth: 800,
		minHeight: 600,
		title: 'Sia Central Desktop',
		icon: path.join(__static, 'icon.png'),
		titleBarStyle: 'hidden',
		backgroundColor: '#1d1e21',
		show: false,
		resizable: true,
		webPreferences: {
			nodeIntegration: true
		}
	});

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

function createTray() {
	tray = new Tray(path.join(__static, 'icons/siacentral_white_16.png'));

	tray.on('double-click', () => {
		if (!win)
			createWindow();

		if (win.isMinimized())
			win.restore();

		win.show();
		win.focus();
	});
}

app.on('second-instance', () => {
	if (!win)
		return;

	if (win.isMinimized())
		win.restore();

	win.show();
	win.focus();
});

// Quit when all windows are closed.
app.on('window-all-closed', (e) => {
	e.preventDefault();
	return false;
});

app.on('activate', () => {
	// On macOS it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (win === null)
		createWindow();
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
			console.error('Vue Devtools failed to install:', e.toString());
		}
	}
	createWindow();
	createTray();
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
