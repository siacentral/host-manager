import path from 'path';
import log from 'electron-log';
import { app, BrowserWindow, shell } from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import { shutdown } from './tray';
import { readWinConfigSync, writeWinConfigSync } from './utils';

export var mainWindow;

app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');
app.commandLine.appendSwitch('js-flags', '--expose_gc --max-old-space-size=1024');

function validNumber(n, def) {
	n = parseInt(n, 10);

	if (!n || isNaN(n) || !isFinite(n))
		return def;

	return n;
}

function createWindow() {
	const windowState = readWinConfigSync(),
		width = validNumber(windowState.width, 1000),
		height = validNumber(windowState.height, 800),
		x = validNumber(windowState.x, null),
		y = validNumber(windowState.y, null);

	const opts = {
		width,
		height,
		x,
		y,
		minWidth: 800,
		minHeight: 600,
		title: 'Sia Host Manager',
		icon: path.join(__static, 'icon.png'),
		autoHideMenuBar: true,
		backgroundColor: '#1d1e21',
		show: false,
		webPreferences: {
			nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
			enableRemoteModule: true,
			webSecurity: false
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
		mainWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL, {
			userAgent: 'Sia-Agent'
		});

		if (!process.env.IS_TEST) mainWindow.webContents.openDevTools();
	} else {
		createProtocol('app');
		// Load the index.html when not in development
		mainWindow.loadURL('app://./index.html', {
			userAgent: 'Sia-Agent'
		});
	}

	const handleRedirect = (e, url) => {
		try {
			if (url.startsWith('http') && url !== mainWindow.webContents.getURL()) {
				shell.openExternal(url);

				e.preventDefault();
				return false;
			}
		} catch (ex) {
			log.error('handleRedirect', ex.message);
		}
	};

	mainWindow.on('close', (e) => {
		try {
			writeWinConfigSync(mainWindow.getBounds());

			if (shutdown) {
				mainWindow = null;
				return;
			}

			if (process.platform === 'darwin')
				app.dock.hide();

			mainWindow.hide();
		} catch (ex) {
			log.error('mainWindow.close', ex);
		}

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
	if (!mainWindow)
		return;

	return mainWindow.webContents.send(event, ...args);
}