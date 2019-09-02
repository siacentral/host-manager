import { decode } from '@stablelib/utf8';
import { promises as fs } from 'fs';
import path from 'path';
import process from 'process';
import { remote } from 'electron';

const app = remote.app,
	dialog = remote.dialog,
	window = remote.getCurrentWindow();

export function getDefaultSiaPath() {
	switch (process.platform) {
	case 'win32':
		return path.join(process.env.LOCALAPPDATA, 'Sia');
	case 'darwin':
		return path.join(process.env.HOME, 'Library', 'Application Support', 'Sia');
	default:
		return path.join(process.env.HOME, '.sia');
	}
}

export function getUserDataPath(subdir) {
	if (subdir)
		return path.join(app.getPath('userData'), '..', subdir);

	return app.getPath('userData');
}

export async function readSiaUIConfig() {
	const configPath = path.join(getUserDataPath('Sia-UI'), 'sia', 'config.json'),
		config = JSON.parse(decode(await fs.readFile(configPath)));

	return {
		'siad_path': config.siad.path,
		'siad_data_path': config.siad.datadir,
		'dark_mode': true // config.darkMode
	};
}

export async function mkdirIfNotExist(path) {
	try {
		await fs.mkdir(path, {
			recursive: true
		});
	} catch (ex) {}
}

export async function writeConfig(config) {
	const siacentralPath = app.getPath('userData');

	await mkdirIfNotExist(siacentralPath);

	return fs.writeFile(path.join(siacentralPath, 'config.json'), JSON.stringify(config, null, '\t'));
}

let config;

export async function getConfig() {
	if (config)
		return config;

	config = await readConfig();

	return config;
}

export async function readConfig() {
	const siacentralPath = app.getPath('userData'),
		config = await fs.readFile(path.join(siacentralPath, 'config.json'));

	return JSON.parse(decode(config));
}

export function getConsensusPath(loc) {
	if (loc)
		return loc;

	return path.join(getUserDataPath(), 'sia');
}

async function folderMissing(folder) {
	try {
		await fs.stat(folder);

		return null;
	} catch (ex) {
		return path.basename(folder);
	}
}

// checks to make sure all of Sia's data directories exist at the specified location
export async function checkSiaDataFolders(loc) {
	const missingFolders = (await Promise.all([
		folderMissing(path.join(loc, 'consensus')),
		folderMissing(path.join(loc, 'gateway')),
		folderMissing(path.join(loc, 'host')),
		folderMissing(path.join(loc, 'renter')),
		folderMissing(path.join(loc, 'transactionpool')),
		folderMissing(path.join(loc, 'wallet'))
	])).filter(f => f !== null);

	return missingFolders;
}

export function getLastItems(arr, n) {
	const len = arr.length,
		min = Math.min(len, n),
		d = len - min;

	let values = [];

	for (let i = len - 1; i >= d; i--)
		values.unshift(arr[i]);

	return values;
};

export function concatUint8Array() {
	let totalSize = 0,
		offset = 0,
		array;

	for (let i = 0; i < arguments.length; i++)
		totalSize += arguments[i].length;

	array = new Uint8Array(totalSize);

	for (let i = 0; i < arguments.length; i++) {
		array.set(arguments[i], offset);

		offset += arguments[i].length;
	}

	return array;
};

export function showSaveDialogAsync(opts) {
	return dialog.showSaveDialog(window, opts);
}

export function showOpenDialogAsync(opts) {
	return dialog.showOpenDialog(window, opts);
}

/**
 * Splits a Uint8Array into equal segments of n length
 * @param {Uint8Array} arr the array to split
 * @param {Number} len the number of bytes per section
 */
export function splitArray(arr, len) {
	const segments = Math.floor(arr.length / len);
	let ret = [];

	for (let i = 0; i < segments; i++)
		ret.push(arr.slice(len * i, len));

	return ret;
}

export function compareVersions(ver1, ver2) {
	const v1 = ver1.match(/[0-9]+\.[0-9]+\.[0-9]+/)[0].split('.'),
		v2 = ver2.match(/[0-9]+\.[0-9]+\.[0-9]+/)[0].split('.'),
		l = v1.length > v2.length ? v2.length : v1.length;

	for (let i = 0; i < l; i++) {
		const a = parseInt(v1[i], 10),
			b = parseInt(v2[i], 10);

		if (a < b)
			return -1;
		else if (a > b)
			return 1;
	}

	return 0;
}

let timeouts = {};

export function debounce(fn, delay) {
	return () => {
		if (timeouts[fn])
			clearTimeout(timeouts[fn]);

		let args = arguments,
			that = this;

		timeouts[fn] = setTimeout(() => {
			fn.apply(that, args);
			timeouts[fn] = null;
		}, delay);
	};
}

export function blobToDataURI(blob) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onerror = reject;
		reader.onload = (e) => resolve(reader.result);

		reader.readAsDataURL(blob);
	});
}

export function sleep(n) {
	return new Promise((resolve) => {
		setTimeout(resolve, n);
	});
}