import { decode } from '@stablelib/utf8';
import fs from 'fs';
import { platform } from 'os';
import path from 'path';
import process from 'process';
import { remote } from 'electron';

const app = remote.app;

export function getDefaultSiaPath() {
	switch (getPlatform()) {
	case 'windows':
		return path.join(process.env.LOCALAPPDATA, 'Sia');
	case 'darwin':
		return path.join(process.env.HOME, 'Library', 'Application Support', 'Sia');
	default:
		return path.join(process.env.HOME, '.sia');
	}
}

export function getUserDataPath(subdir) {
	return path.join(app.getPath('userData'), '..', subdir);
}

export async function readSiaUIConfig() {
	const configPath = path.join(getUserDataPath('Sia-UI'), 'sia', 'config.json'),
		config = JSON.parse(decode(await readFileAsync(configPath)));

	return {
		'siad_path': config.siad.path,
		'siad_data_path': config.siad.datadir,
		'dark_mode': true // config.darkMode
	};
}

export async function getDefaultAPIPassword() {
	const passwordFile = path.join(getDefaultSiaPath(), 'apipassword'),
		data = decode(await readFileAsync(passwordFile)).trim();

	return data;
};

export async function writeConfig(config) {
	const siacentralPath = app.getPath('userData');

	await mkdirAsync(siacentralPath);

	return writeFileAsync(path.join(siacentralPath, 'config.json'), JSON.stringify(config, null, '\t'));
}

export async function readConfig() {
	const siacentralPath = app.getPath('userData'),
		config = await readFileAsync(path.join(siacentralPath, 'config.json'));

	if (!config.siad_api_password || typeof config.siad_api_password !== 'string' || config.siad_api_password.length === 0)
		config.siad_api_password = await getDefaultAPIPassword();

	return JSON.parse(decode(config));
}

export function readFileAsync(path) {
	return new Promise((resolve, reject) => {
		fs.readFile(path, (err, data) => {
			if (err) {
				reject(err);
				return;
			}

			resolve(data);
		});
	});
};

export function writeFileAsync(path, data) {
	return new Promise((resolve, reject) => {
		fs.writeFile(path, data, (err) => {
			if (err) {
				reject(err);
				return;
			}

			resolve(data);
		});
	});
};

/**
 * Async Promise wrapper around fs.mkdir
 * @param {string} dirPath the path of the directory to create
 */
function mkdirAsync(dirPath) {
	return new Promise((resolve, reject) => {
		fs.mkdir(dirPath, {
			recursive: true
		}, (err) => {
			if (err) {
				reject(err);
				return;
			}

			resolve();
		});
	});
}

export function fileExistsAsync(path) {
	return new Promise((resolve, reject) => {
		fs.stat(path, (err) => {
			if (err) {
				resolve(false);
				return;
			}

			resolve(true);
		});
	});
};

export function getPlatform() {
	const os = platform();

	switch (os) {
	case 'win32':
		return 'windows';
	default:
		return os;
	}
};

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

export function formatSeconds(seconds) {
	const denoms = [31536000, 2628000, 86400, 3600, 60, 1],
		len = denoms.length;

	let time = seconds, str = [];

	for (let i = 0; i < len; i++) {
		const d = denoms[i];

		if (time < d) {
			str.push('00');
			continue;
		}

		const amt = Math.floor(time / d);

		time = time % d;

		str.push(amt < 10 ? `0${amt}` : amt.toString());
	}

	while (str[0] === '00' && str.length > 3)
		str.shift();

	return str.join(':');
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