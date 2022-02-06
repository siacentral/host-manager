import process from 'process';
import { spawn } from 'child_process';
import { decode } from '@stablelib/utf8';
import log from 'electron-log';

import SiaApiClient from './api';

function buildArgs(config) {
	const args = [];

	if (typeof config.siad_data_path === 'string' && config.siad_data_path.length > 0)
		args.push('-d', config.siad_data_path);

	if (typeof config.siad_modules === 'string' && config.siad_modules.length !== 0)
		args.push('-M', config.siad_modules);

	if (typeof config.siad_api_agent === 'string' && config.siad_api_agent.length > 0)
		args.push('--agent', config.siad_api_agent);

	if (typeof config.siad_host_port === 'string' && config.siad_host_port.length > 0)
		args.push('--host-addr', config.siad_host_port);

	if (typeof config.siad_siamux_port === 'string' && config.siad_siamux_port.length > 0)
		args.push('--siamux-addr', config.siad_siamux_port);

	if (typeof config.siad_siamux_ws_port === 'string' && config.siad_siamux_ws_port.length > 0)
		args.push('--siamux-addr-ws', config.siad_siamux_ws_port);

	if (typeof config.siad_rpc_port === 'string' && config.siad_rpc_port.length > 0)
		args.push('--rpc-addr', config.siad_rpc_port);

	if (typeof config.siad_api_addr === 'string' && config.siad_api_addr.length > 0)
		args.push('--api-addr', config.siad_api_addr);

	return args;
}

function buildEnv(config) {
	const env = JSON.parse(JSON.stringify(process.env));

	if (typeof config.siad_wallet_password === 'string' && config.siad_wallet_password.length > 0)
		env.SIA_WALLET_PASSWORD = config.siad_wallet_password;

	if (typeof config.siad_api_password === 'string' && config.siad_api_password.length > 0)
		env.SIA_API_PASSWORD = config.siad_api_password;

	return env;
}

function checkConfig(config) {
	if (!config)
		throw new Error('config is required');

	if (typeof config.siad_path !== 'string')
		throw new Error('siad_path is required');

	if (typeof config.siad_data_path !== 'string')
		throw new Error('siad_data_path is required');

	if (typeof config.siad_modules !== 'string')
		config.siad_modules = 'gctwhf';

	return config;
}

function parseStdOut(output) {
	const loadingRegex = /^\((?<numerator>[0-9]+)\/(?<denominator>[0-9]+)\) Loading (?<module>.+)\.{3}$/gm;

	let loaded = 0, total = 0, current, match, rounds = 0;

	do {
		match = loadingRegex.exec(output);

		if (!match || !match.groups)
			continue;

		loaded = parseInt(match.groups.numerator, 10);
		total = parseInt(match.groups.denominator, 10);
		current = match.groups.module;

		if (isNaN(loaded) || !isFinite(loaded))
			loaded = 0;

		if (isNaN(total) || !isFinite(total))
			total = 1;

		rounds++;
	} while (match != null && rounds < 15); // if there are more than 15 modules something has gone horribly wrong

	return {
		loaded,
		total,
		current
	};
}

export default class SiaDaemon {
	constructor(config) {
		this._config = checkConfig(config);
		this._events = {};
	}

	async available() {
		try {
			const client = new SiaApiClient(this._config);

			await client.getDaemonVersion();

			return true;
		} catch (ex) {
			log.warn('SiaDaemon.available', ex);
		}

		return false;
	}

	async loaded() {
		try {
			const client = new SiaApiClient(this._config);
			await client.getHost();
			return true;
		} catch (ex) {
			log.warn('SiaDaemon.loaded', ex);
		}
		return false;
	}

	running() {
		return this._proc && this._proc.pid;
	}

	async shutdown() {
		const that = this;

		if (!this.running())
			return;

		const waitForExit = new Promise(resolve => {
				that._proc.on('close', resolve);
			}),
			client = new SiaApiClient(this._config);

		try {
			await client.stopDaemon();
		} catch (ex) {
			this._proc.kill();
		}

		return waitForExit;
	}

	async start() {
		const that = this;

		if (that.running() || (await that.available()))
			return Promise.reject(new Error('daemon is already running'));

		return new Promise((resolve, reject) => {
			try {
				const opts = {
					windowsHide: true,
					env: buildEnv(that._config)
				};

				that._start = Date.now();

				if (process.geteuid)
					opts.uid = process.geteuid();

				that._proc = spawn(that._config.siad_path, buildArgs(that._config), opts);

				const loadedCheck = setInterval(async() => {
					this._loaded = await that.loaded();
					if (this._loaded) {
						clearInterval(loadedCheck);
						that._trigger('loaded', that.stats());
						log.info('Sia API available');
						resolve();
					}
				}, 1000);

				that._proc.on('error', ex => {
					try {
						that._trigger('error', ex.message);
					} catch (ex) {
						log.error('daemon.on.error', ex);
					}
				});

				that._proc.stdout.on('data', data => {
					try {
						that._stdout = that._stdout || '';
						that._stdout += decode(data);

						const { loaded, total, current } = parseStdOut(that._stdout);

						that._loadedMods = loaded;
						that._totalMods = total;
						that._currentMod = current;

						if (!that._loaded)
							log.info('SIA STDOUT:\n', that._stdout);

						that._trigger('stdout', that.stats());
					} catch (ex) {
						log.error('daemon.on.stdout', ex);
					}
				});

				that._proc.stderr.on('data', data => {
					try {
						that._stderr = that._stderr || '';
						that._stderr += decode(data);

						that._trigger('stderr', that.stats());
					} catch (ex) {
						log.error('daemon.on.stderr', ex);
					}
				});

				that._proc.on('close', code => {
					try {
						that._trigger('exit', code, that.stats());

						that._proc = null;
						that._stdout = null;
						that._stderr = null;
						that._start = null;
						that._loaded = null;
						that._loadedMods = null;
						that._totalMods = null;
						that._currentMod = null;
					} catch (ex) {
						log.error('daemon.on.close', ex);
					}
				});
			} catch (ex) {
				reject(ex);
			}
		});
	}

	stats() {
		return {
			stdout: this._stdout,
			stderr: this._stderr,
			start: this._start,
			loaded: this._loaded,
			modules: {
				loaded: this._loadedMods,
				total: this._totalMods,
				module: this._currentMod
			}
		};
	}

	on(event, handler) {
		if (!Array.isArray(this._events[event]))
			this._events[event] = [];

		this._events[event].push(handler);
	}

	off(event, handler) {
		if (!Array.isArray(this._events[event]))
			return;

		const i = this._events[event].indexOf(handler);

		if (i === -1)
			return;

		this._events[event].splice(i, 1);
	}

	_trigger(event, ...args) {
		if (!Array.isArray(this._events[event]))
			return;

		for (let i = 0; i < this._events[event].length; i++)
			this._events[event][i].apply(this, args);
	}
};