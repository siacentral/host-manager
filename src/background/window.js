import path from 'path';
import { app, BrowserWindow, shell } from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import { shutdown } from './tray';

export var mainWindow;

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
	mainWindow = new BrowserWindow(opts);

	if (process.env.WEBPACK_DEV_SERVER_URL) {
		// Load the url of the dev server if in development mode
		mainWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
		if (!process.env.IS_TEST) mainWindow.webContents.openDevTools();
	} else {
		createProtocol('app');
		// Load the index.html when not in development
		mainWindow.loadURL('app://./index.html');
	}

	const handleRedirect = (e, url) => {
		if (url.startsWith('http') && url !== mainWindow.webContents.getURL()) {
			shell.openExternal(url);

			e.preventDefault();
			return false;
		}
	};

	mainWindow.on('close', (e) => {
		if (shutdown)
			return;

		if (process.platform === 'darwin')
			app.dock.hide();

		mainWindow.hide();
		e.preventDefault();

		return false;
	});

	mainWindow.webContents.on('will-navigate', handleRedirect);
	mainWindow.webContents.on('new-window', handleRedirect);

	mainWindow.show();
	mainWindow.focus();
}

export function openWindow() {
	if (!mainWindow)
		createWindow();

	if (mainWindow.isMinimized())
		mainWindow.restore();

	if (process.platform === 'darwin')
		app.dock.show();

	mainWindow.show();
	mainWindow.focus();
}

export function sendIPC(event, ...args) {
	return mainWindow.webContents.send(event, ...args);
}