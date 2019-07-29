import Store from '@/store';
import path from 'path';
import process from 'process';
import { remote } from 'electron';
import { spawn } from 'child_process';
import { decode } from '@stablelib/utf8';
import log from 'electron-log';

import SiaApiClient from '@/api/sia';
import { getUserDataPath } from './index';

let siaProcess, shutdown = false, stdout = '', stderr = '';

function buildArgs(config) {
	const args = [];

	if (config.siad_data_path && config.siad_data_path.length > 0)
		args.push('-d', config.siad_data_path);
	else
		args.push('-d', path.join(getUserDataPath('Sia-UI'), 'sia'));

	if (config.siad_api_agent && config.siad_api_agent.length > 0)
		args.push('--agent', config.siad_api_agent);

	if (config.siad_host_port && config.siad_host_port.length > 0)
		args.push('--host-port', config.siad_host_port);

	if (config.siad_rpc_port && config.siad_rpc_port.length > 0)
		args.push('--rpc-port', config.siad_rpc_port);

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

	if (!remote.app.isPackaged)
		return path.join(__static, '..', 'build', 'bin', process.platform, binary);

	return path.join(process.resourcesPath, 'bin', binary);
}

function parseStdOut(output) {
	const loadLines = output.match(/^\([0-9]\/[0-9]\) .*$/gm);
	let loadNum = 0, loadDenom = 0, loadModule;

	if (!loadLines || loadLines.length === 0)
		return;

	loadLines.forEach(l => {
		let lineFrac = l.match(/^\([0-9]\/[0-9]/),
			lineModule = l.match(/Loading [a-zA-Z]+/);

		if (!lineModule || lineModule.length === 0)
			lineModule = '';
		else
			lineModule = lineModule[0].replace('Loading ', '').trim();

		if (!lineFrac || lineFrac.length === 0)
			return;

		lineFrac = lineFrac[0].substr(1).split('/').map(l => parseInt(l, 10));

		if (lineFrac.length < 2)
			return;

		if (loadNum < lineFrac[0]) {
			loadNum = lineFrac[0];
			loadModule = lineModule;
		}

		if (loadDenom < lineFrac[1])
			loadDenom = lineFrac[1];
	});

	if (loadDenom <= 0)
		loadDenom = 1;

	Store.dispatch('hostDaemon/setLoadPercent', loadNum / loadDenom);
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
				console.log(ex.message);
			}

			Store.dispatch('hostDaemon/setManaged', true);

			siaProcess = spawn(daemonPath, buildArgs(config), opts);

			siaProcess.stdout.on('data', data => {
				stdout += decode(data);

				parseStdOut(stdout);

				if (stdout.indexOf('Finished loading in') >= 0) {
					Store.dispatch('hostDaemon/setLoaded', true);
					resolve();
				}

				Store.dispatch('hostDaemon/setOutput', stdout);
			});

			siaProcess.stderr.on('data', data => {
				stderr += decode(data);

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