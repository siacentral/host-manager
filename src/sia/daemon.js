import Store from '@/store';
import path from 'path';
import process from 'process';
import { remote } from 'electron';
import { spawn } from 'child_process';
import { decode } from '@stablelib/utf8';
import log from 'electron-log';

import SiaApiClient from '@/sia/api';
import { getUserDataPath } from '../utils/index';

let siaProcess, shutdown = false, stdout = '', stderr = '';

function buildArgs(config) {
	const args = [];

	if (config.siad_data_path && config.siad_data_path.length > 0)
		args.push('-d', config.siad_data_path);
	else
		args.push('-d', path.join(getUserDataPath(), 'sia'));

	if (config.siad_api_agent && config.siad_api_agent.length > 0)
		args.push('--agent', config.siad_api_agent);

	if (config.siad_host_port && config.siad_host_port.length > 0)
		args.push('--host-addr', config.siad_host_port);

	if (config.siad_rpc_port && config.siad_rpc_port.length > 0)
		args.push('--rpc-addr', config.siad_rpc_port);

	if (config.siad_api_addr && config.siad_api_addr.length > 0)
		args.push('--api-addr', config.siad_api_addr);

	return args;
}

function buildEnv(config) {
	const env = JSON.parse(JSON.stringify(process.env));

	if (config.siad_wallet_password && config.siad_wallet_password.length > 0)
		env['SIA_WALLET_PASSWORD'] = config.siad_wallet_password;

	return env;
}

function getPath() {
	const binary = process.platform === 'win32' ? 'siad.exe' : 'siad';

	if (!remote.app.isPackaged) {
		let platform = process.platform;

		if (platform === 'win32')
			platform = 'win';
		else if (platform === 'darwin')
			platform = 'mac';

		return path.join(__static, '..', 'build', 'bin', platform, binary);
	}

	return path.join(process.resourcesPath, 'bin', binary);
}

function parseStdOut(output) {
	const loadingRegex = /^\((?<numerator>[0-9]+)\/(?<denominator>[0-9]+)\) Loading (?<module>.+)\.{3}$/gm;

	let loadNum = 0, loadDenom = 0, loadModule, match, rounds = 0;

	do {
		match = loadingRegex.exec(output);

		if (!match || !match.groups)
			continue;

		loadNum = parseInt(match.groups.numerator, 10);
		loadDenom = parseInt(match.groups.denominator, 10);
		loadModule = match.groups.module;

		if (isNaN(loadNum) || !isFinite(loadNum))
			loadNum = 0;

		if (isNaN(loadDenom) || !isFinite(loadDenom))
			loadDenom = 1;

		rounds++;
	} while (match != null && rounds < 15);

	Store.dispatch('hostDaemon/setLoadPercent', loadNum / (loadDenom + 1));
	Store.dispatch('hostDaemon/setCurrentModule', loadModule);
}

export async function stop() {
	const waitForExit = new Promise(resolve => {
			siaProcess.on('close', code => resolve(code));
		}),
		client = new SiaApiClient(Store.state.config);

	await client.stopDaemon();

	return waitForExit;
}

export function stdOut() {
	return stdout;
}

export function stdErr() {
	return stderr;
}

export function launch(config) {
	const daemonPath = getPath();

	config = config || {};

	if (siaProcess)
		return;

	shutdown = false;
	stdout = '';
	stderr = '';

	Store.dispatch('hostDaemon/setManaged', false);
	Store.dispatch('hostDaemon/setLoaded', false);
	Store.dispatch('hostDaemon/setLoadPercent', 0);
	Store.dispatch('hostDaemon/setCurrentModule', '');
	Store.dispatch('hostDaemon/setError', '');
	Store.dispatch('hostDaemon/setOutput', '');

	return new Promise(async(resolve, reject) => {
		try {
			const opts = {
					windowsHide: true,
					env: buildEnv(config)
				},
				startTime = Date.now();

			if (process.geteuid)
				opts.uid = process.geteuid();

			try {
				const client = new SiaApiClient(Store.state.config);

				await client.getDaemonVersion();

				log.info('daemon already started not launching');
				resolve();
				return;
			} catch (ex) {
				// useful debug message will be removed when packaged
				console.log(ex);
			}

			Store.dispatch('hostDaemon/setManaged', true);

			siaProcess = spawn(daemonPath, buildArgs(config), opts);

			siaProcess.stdout.on('data', data => {
				stdout += decode(data);

				// useful debug message will be removed when packaged
				// console.log(stdout);

				parseStdOut(stdout);

				if (stdout.indexOf('Finished loading in') >= 0) {
					console.log(stdout);
					Store.dispatch('hostDaemon/setLoaded', true);

					setTimeout(resolve, 300);
				}

				Store.dispatch('hostDaemon/setOutput', stdout);
			});

			siaProcess.stderr.on('data', data => {
				stderr += decode(data);

				// useful debug message will be removed when packaged
				console.error(stderr);

				Store.dispatch('hostDaemon/setError', stderr);
			});

			siaProcess.on('close', code => {
				if (shutdown)
					return;

				siaProcess = null;

				Store.dispatch('hostDaemon/setManaged', false);
				Store.dispatch('hostDaemon/setLoaded', false);
				Store.dispatch('hostDaemon/setLoadPercent', 0);
				Store.dispatch('hostDaemon/setCurrentModule', '');

				if (stderr && stderr.trim().length > 0)
					log.error(stderr);

				if (Date.now() - startTime < 10000) {
					Store.dispatch('hostDaemon/setLoaded', false);
					Store.dispatch('hostDaemon/setManaged', false);
					Store.dispatch('setCriticalError', 'daemon is unable to stay running. check your logs for more information.');
					return;
				}

				if (shutdown)
					return;

				launch(config);
			});
		} catch (ex) {
			reject(ex);
		}
	});
}