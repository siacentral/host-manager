const { app, Tray, BrowserWindow, shell } = require('electron');

let mainWindow, tray, url, iconPath, trayIconPath;

if (process.env.NODE_ENV === 'production') {
	url = `file://${process.cwd()}/index.html`;
	iconPath = `${process.cwd()}/icons/siacentral-icon_512.png`;
	trayIconPath = `${process.cwd()}/icons/siacentral_white_16.png`;
} else {
	url = 'http://localhost:8080';
	iconPath = `${process.cwd()}/public/icons/siacentral-icon_512.png`;
	trayIconPath = `${process.cwd()}/public/icons/siacentral_white_16.png`;
}

if (!app.requestSingleInstanceLock()) {
	app.quit();
	return;
}

app.on('second-instance', () => {
	if (!mainWindow)
		return;

	if (mainWindow.isMinimized())
		mainWindow.restore();

	mainWindow.show();
	mainWindow.focus();
});

function buildTray() {
	tray = new Tray(trayIconPath);

	tray.on('double-click', (ex) => {
		if (mainWindow.isMinimized())
			mainWindow.restore();

		mainWindow.show();
		mainWindow.focus();
	});
}

function buildMainWindow() {
	mainWindow = new BrowserWindow({
		width: 1000,
		height: 800,
		minWidth: 800,
		minHeight: 600,
		icon: iconPath,
		title: 'SiaCentral Host Manager',
		titleBarStyle: 'hidden',
		backgroundColor: '#1d1e21',
		show: false,
		resizable: false,
		webPreferences: {
			nodeIntegration: true,
			nodeIntegrationInWorker: true,
			webSecurity: false
		}
	});

	mainWindow.setMenuBarVisibility(false);

	const handleRedirect = (e, url) => {
		if (url.startsWith('http') && url !== mainWindow.webContents.getURL()) {
			shell.openExternal(url);

			e.preventDefault();
			return false;
		}
	};

	mainWindow.webContents.on('will-navigate', handleRedirect);
	mainWindow.webContents.on('new-window', handleRedirect);

	mainWindow.on('minimize', (e) => {
		e.preventDefault();
		mainWindow.hide();
	});

	mainWindow.on('page-title-updated', (e) => e.preventDefault());

	mainWindow.on('close', (e) => {
		e.preventDefault();
		mainWindow.hide();

		return false;
	});

	mainWindow.on('ready-to-show', () => mainWindow.show());
	mainWindow.loadURL(url, {
		userAgent: 'Sia-Agent'
	});
}

app.on('ready', () => {
	buildMainWindow();
	buildTray();
});