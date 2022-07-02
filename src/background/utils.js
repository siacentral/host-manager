import { app } from 'electron';
import fs from 'fs';
import path from 'path';
import { encode, decode } from '@stablelib/utf8';

const windowConfigPath = path.join(app.getPath('userData'), 'windowState.json'),
	defaultConfig = {
		width: 1000,
		height: 800
	};

export function readWinConfigSync() {
	try {
		const buf = fs.readFileSync(windowConfigPath);

		return {
			...defaultConfig,
			...JSON.parse(decode(buf))
		};
	} catch {
		return { ...defaultConfig };
	}
}

export function writeWinConfigSync(cfg) {
	const existing = readWinConfigSync();

	return fs.writeFileSync(windowConfigPath, encode(JSON.stringify({
		...existing,
		...cfg
	})));
}