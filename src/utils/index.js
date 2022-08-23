import { decode } from '@stablelib/utf8';
import { promises as fs } from 'fs';
import path from 'path';
import { ipcRenderer } from 'electron';
import BigNumber from 'bignumber.js';
import log from 'electron-log';

export async function getUserDataPath(subdir) {
	const path = await ipcRenderer.invoke('getPath', 'userData');
	if (subdir)
		return path.join(path, '..', subdir);
	return path;
}

export async function readSiaUIConfig() {
	const siaUIPath = await getUserDataPath('Sia-UI'),
		siaUIDataPath = path.join(siaUIPath, 'sia'),
		config = {
			dark_mode: true,
			siad_data_path: siaUIDataPath
		};

	try {
		const { siad } = JSON.parse(decode(await fs.readFile(path.join(siaUIDataPath, 'config.json'))));

		if (typeof siad.datadir === 'string' && siad.datadir.length !== 0)
			config.siad_data_path = siad.datadir;
	} catch (ex) {
		console.log('unable to decode Sia-UI config json', ex);
	}

	return config;
}

export async function mkdirIfNotExist(path) {
	try {
		await fs.mkdir(path, {
			recursive: true
		});
	} catch (ex) { }
}

export async function writeConfig(config) {
	const userDataPath = await getUserDataPath();
	await mkdirIfNotExist(userDataPath);
	return fs.writeFile(path.join(userDataPath, 'config.json'), JSON.stringify(config, null, '\t'));
}

export async function readConfig() {
	const userDataPath = await getUserDataPath(),
		buf = await fs.readFile(path.join(userDataPath, 'config.json')),
		config = {
			data_unit: 'decimal',
			siad_data_path: path.join(userDataPath, 'sia'),
			...JSON.parse(decode(buf))
		};

	if (typeof config.data_unit === 'string')
		config.data_unit = config.data_unit.toLowerCase() !== 'binary' ? 'decimal' : 'binary';

	// validate contract filter
	if (config.contract_filter) {
		if (!Array.isArray(config.contract_filter.statuses) || config.contract_filter.statuses.length === 0)
			config.contract_filter.statuses = ['active'];

		if (typeof config.contract_filter.revenue_min === 'string' && config.contract_filter.revenue_min.length > 0) {
			const val = new BigNumber(config.contract_filter.revenue_min);

			if (!val.isNaN() || !val.isFinite())
				config.contract_filter.revenue_min = null;
			else
				config.contract_filter.revenue_min = val;
		}

		if (typeof config.contract_filter.revenue_max === 'string' && config.contract_filter.revenue_max.length > 0) {
			const val = new BigNumber(config.contract_filter.revenue_max);

			if (!val.isNaN() || !val.isFinite())
				config.contract_filter.revenue_max = null;
			else
				config.contract_filter.revenue_max = val;
		}

		if (config.contract_filter.start_date) {
			const time = Date.parse(config.contract_filter.start_date);

			if (isNaN(time))
				config.contract_filter.start_date = null;
			else
				config.contract_filter.start_date = new Date(time);
		}

		if (config.contract_filter.end_date) {
			const time = Date.parse(config.contract_filter.end_date);

			if (isNaN(time))
				config.contract_filter.end_date = null;
			else
				config.contract_filter.end_date = new Date(time);
		}
	} else
		config.contract_filter = { statuses: ['active'] };

	return config;
}

export function getLogPath() {
	return path.dirname(log.transports.file.getFile().path);
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

	const values = [];

	for (let i = len - 1; i >= d; i--)
		values.unshift(arr[i]);

	return values;
};

export function concatUint8Array() {
	let totalSize = 0,
		offset = 0;
	for (let i = 0; i < arguments.length; i++)
		totalSize += arguments[i].length;

	const array = new Uint8Array(totalSize);
	for (let i = 0; i < arguments.length; i++) {
		array.set(arguments[i], offset);

		offset += arguments[i].length;
	}

	return array;
};

/**
 * Splits a Uint8Array into equal segments of n length
 * @param {Uint8Array} arr the array to split
 * @param {Number} len the number of bytes per section
 */
export function splitArray(arr, len) {
	const segments = Math.floor(arr.length / len);
	const ret = [];

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

const timeouts = {};

export function debounce(fn, delay) {
	return () => {
		if (timeouts[fn])
			clearTimeout(timeouts[fn]);

		const args = arguments,
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