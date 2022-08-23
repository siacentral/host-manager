import { ipcMain, dialog, app, shell } from 'electron';

import { attachDaemonIPC } from './daemon';
import { attachUpdateIPC } from './autoupdate';

import { mainWindow } from './window';

function minimize() {
	mainWindow.minimize();
}

function maximize() {
	if (mainWindow.isMaximized())
		mainWindow.unmaximize();
	else
		mainWindow.maximize();
}

function close() {
	mainWindow.close();
}

function openDialog(event, method, params) {
	return dialog[method](params);
}

function getPath(event, path) {
	return app.getPath(path);
}

function openPath(path) {
	return shell.openPath(path);
}

export function attachIPC() {
	ipcMain.handle('dialog', openDialog);
	ipcMain.handle('minimize', minimize);
	ipcMain.handle('maximize', maximize);
	ipcMain.handle('close', close);
	ipcMain.handle('getPath', getPath);
	ipcMain.handle('getAppVersion', () => app.getVersion());
	ipcMain.handle('openPath', openPath);

	attachUpdateIPC();
	attachDaemonIPC();
}