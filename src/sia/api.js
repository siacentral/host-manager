import path from 'path';
import process from 'process';
import { promises as fs } from 'fs';
import log from 'electron-log';
import request from 'request';
import { decode } from '@stablelib/utf8';

export async function sendJSONRequest(url, opts) {
	opts = {
		method: 'GET',
		timeout: 60000,
		...(opts || {})
	};

	return new Promise((resolve, reject) => {
		if (url.indexOf('http') < 0)
			url = `http://${url}`;

		if (opts.body && typeof opts.body !== 'string')
			opts.body = JSON.stringify(opts.body);

		request(url, opts, (err, resp, body) => {
			if (err)
				return reject(err);

			const r = { ...resp.toJSON() };

			try {
				r.body = JSON.parse(body);
			} catch (ex) {}

			if (r.statusCode >= 200 && r.statusCode < 300)
				r.statusCode = 200;

			resolve(r);
		});
	});
}

function getDefaultSiaPath() {
	switch (process.platform) {
	case 'win32':
		return path.join(process.env.LOCALAPPDATA, 'Sia');
	case 'darwin':
		return path.join(process.env.HOME, 'Library', 'Application Support', 'Sia');
	default:
		return path.join(process.env.HOME, '.sia');
	}
}

export default class SiaApiClient {
	constructor(opts) {
		opts = opts || {};

		this.config = {
			siad_api_addr: opts.siad_api_addr || 'localhost:9980',
			siad_api_agent: opts.siad_api_agent || 'Sia-Agent'
		};

		if (typeof opts.siad_api_password === 'string' && opts.siad_api_password.trim().length !== 0)
			this._defaultApiPassword = opts.siad_api_password;
	}

	async getDefaultAPIPassword() {
		if (this._defaultApiPassword)
			return this._defaultApiPassword;

		if (process.env.SIA_API_PASSWORD && process.env.SIA_API_PASSWORD.length > 0) {
			this._defaultApiPassword = process.env.SIA_API_PASSWORD;

			return this._defaultApiPassword;
		}

		const passwordFile = path.join(getDefaultSiaPath(), 'apipassword'),
			data = decode(await fs.readFile(passwordFile)).trim();

		this._defaultApiPassword = data;

		return this._defaultApiPassword;
	}

	async walletUnlockConditions(addr) {
		const apiPassword = await this.getDefaultAPIPassword();

		return sendJSONRequest(`${this.config.siad_api_addr}/wallet/unlockconditions/${addr}`, {
			method: 'GET',
			headers: {
				'User-Agent': this.config.siad_api_agent
			},
			auth: {
				username: '',
				password: apiPassword
			}
		});
	}

	async checkCredentials() {
		try {
			// hard coded address doesn't matter since we just want to check the API credentials
			const resp = await this.walletUnlockConditions('2d6c6d705c80f17448d458e47c3fb1a02a24e018a82d702cda35262085a3167d98cc7a2ba339');

			if (resp.statusCode === 200)
				return true;

			if (resp.body.message && resp.body.message.indexOf('wallet must be unlocked before it can be used') !== -1)
				return true;

			if (resp.body.message && resp.body.message.indexOf('no record of UnlockConditions for that UnlockHash') !== -1)
				return true;
		} catch (ex) {
			log.error('check api credentials', ex.message);
		}

		return false;
	}

	async getDaemonVersion() {
		const apiPassword = await this.getDefaultAPIPassword();

		return sendJSONRequest(`${this.config.siad_api_addr}/daemon/version`, {
			method: 'GET',
			headers: {
				'User-Agent': this.config.siad_api_agent
			},
			auth: {
				username: '',
				password: apiPassword
			}
		});
	}

	async stopDaemon() {
		const apiPassword = await this.getDefaultAPIPassword();

		return sendJSONRequest(`${this.config.siad_api_addr}/daemon/stop`, {
			method: 'GET',
			headers: {
				'User-Agent': this.config.siad_api_agent
			},
			auth: {
				username: '',
				password: apiPassword
			}
		});
	}

	async getConsensus() {
		const apiPassword = await this.getDefaultAPIPassword();

		return sendJSONRequest(`${this.config.siad_api_addr}/consensus`, {
			method: 'GET',
			headers: {
				'User-Agent': this.config.siad_api_agent
			},
			auth: {
				username: '',
				password: apiPassword
			}
		});
	}

	async getBlock(height) {
		const apiPassword = await this.getDefaultAPIPassword();

		return sendJSONRequest(`${this.config.siad_api_addr}/consensus/blocks?height=${height}`, {
			method: 'GET',
			headers: {
				'User-Agent': this.config.siad_api_agent
			},
			auth: {
				username: '',
				password: apiPassword
			}
		});
	}

	async getGateway() {
		const apiPassword = await this.getDefaultAPIPassword();

		return sendJSONRequest(`${this.config.siad_api_addr}/gateway`, {
			method: 'GET',
			headers: {
				'User-Agent': this.config.siad_api_agent
			},
			auth: {
				username: '',
				password: apiPassword
			}
		});
	}

	async getHostDB() {
		const apiPassword = await this.getDefaultAPIPassword();

		return sendJSONRequest(`${this.config.siad_api_addr}/hostdb`, {
			method: 'GET',
			headers: {
				'User-Agent': this.config.siad_api_agent
			},
			auth: {
				username: '',
				password: apiPassword
			}
		});
	}

	async getHost() {
		const apiPassword = await this.getDefaultAPIPassword();

		return sendJSONRequest(`${this.config.siad_api_addr}/host`, {
			method: 'GET',
			headers: {
				'User-Agent': this.config.siad_api_agent
			},
			auth: {
				username: '',
				password: apiPassword
			}
		});
	}

	async getHostContracts() {
		const apiPassword = await this.getDefaultAPIPassword();

		return sendJSONRequest(`${this.config.siad_api_addr}/host/contracts`, {
			method: 'GET',
			headers: {
				'User-Agent': this.config.siad_api_agent
			},
			auth: {
				username: '',
				password: apiPassword
			}
		});
	}

	async getHostStorage() {
		const apiPassword = await this.getDefaultAPIPassword();

		return sendJSONRequest(`${this.config.siad_api_addr}/host/storage`, {
			method: 'GET',
			headers: {
				'User-Agent': this.config.siad_api_agent
			},
			auth: {
				username: '',
				password: apiPassword
			}
		});
	}

	async getTransactionpoolFee() {
		const apiPassword = await this.getDefaultAPIPassword();

		return sendJSONRequest(`${this.config.siad_api_addr}/tpool/fee`, {
			method: 'GET',
			headers: {
				'User-Agent': this.config.siad_api_agent
			},
			auth: {
				username: '',
				password: apiPassword
			}
		});
	}

	async getWallet() {
		const apiPassword = await this.getDefaultAPIPassword();

		return sendJSONRequest(`${this.config.siad_api_addr}/wallet`, {
			method: 'GET',
			headers: {
				'User-Agent': this.config.siad_api_agent
			},
			auth: {
				username: '',
				password: apiPassword
			}
		});
	}

	async createWalletAddress() {
		const apiPassword = await this.getDefaultAPIPassword();

		return sendJSONRequest(`${this.config.siad_api_addr}/wallet/address`, {
			method: 'GET',
			headers: {
				'User-Agent': this.config.siad_api_agent
			},
			auth: {
				username: '',
				password: apiPassword
			}
		});
	}

	async getWalletAddresses(count) {
		const apiPassword = await this.getDefaultAPIPassword();

		return sendJSONRequest(`${this.config.siad_api_addr}/wallet/seedaddrs?count=${count}`, {
			method: 'GET',
			headers: {
				'User-Agent': this.config.siad_api_agent
			},
			auth: {
				username: '',
				password: apiPassword
			}
		});
	}

	async unlockWallet(encryptionpassword) {
		const apiPassword = await this.getDefaultAPIPassword();

		return sendJSONRequest(`${this.config.siad_api_addr}/wallet/unlock`, {
			method: 'POST',
			timeout: 10000,
			headers: {
				'User-Agent': this.config.siad_api_agent
			},
			auth: {
				username: '',
				password: apiPassword
			},
			form: {
				encryptionpassword
			}
		});
	}

	async createWallet(encryptionpassword) {
		const apiPassword = await this.getDefaultAPIPassword();

		return sendJSONRequest(`${this.config.siad_api_addr}/wallet/init`, {
			method: 'POST',
			headers: {
				'User-Agent': this.config.siad_api_agent
			},
			auth: {
				username: '',
				password: apiPassword
			},
			form: {
				encryptionpassword
			}
		});
	}

	async recoverWallet(seed, encryptionpassword) {
		const apiPassword = await this.getDefaultAPIPassword();

		return sendJSONRequest(`${this.config.siad_api_addr}/wallet/init/seed`, {
			method: 'POST',
			headers: {
				'User-Agent': this.config.siad_api_agent
			},
			auth: {
				username: '',
				password: apiPassword
			},
			form: {
				encryptionpassword,
				seed
			}
		});
	}

	async getTPoolFees() {
		const apiPassword = await this.getDefaultAPIPassword();

		return sendJSONRequest(`${this.config.siad_api_addr}/tpool/fee`, {
			method: 'GET',
			headers: {
				'User-Agent': this.config.siad_api_agent
			},
			auth: {
				username: '',
				password: apiPassword
			}
		});
	}

	async announceHost(address) {
		const apiPassword = await this.getDefaultAPIPassword();

		const form = {};

		if (address && typeof address === 'string')
			form.netaddress = address;

		return sendJSONRequest(`${this.config.siad_api_addr}/host/announce`, {
			method: 'POST',
			headers: {
				'User-Agent': this.config.siad_api_agent
			},
			auth: {
				username: '',
				password: apiPassword
			},
			form
		});
	}

	async updateHost(config) {
		const apiPassword = await this.getDefaultAPIPassword();

		return sendJSONRequest(`${this.config.siad_api_addr}/host`, {
			method: 'POST',
			headers: {
				'User-Agent': this.config.siad_api_agent
			},
			auth: {
				username: '',
				password: apiPassword
			},
			form: config
		});
	}

	async addStorageFolder(path, size) {
		const apiPassword = await this.getDefaultAPIPassword();

		return sendJSONRequest(`${this.config.siad_api_addr}/host/storage/folders/add`, {
			method: 'POST',
			headers: {
				'User-Agent': this.config.siad_api_agent
			},
			auth: {
				username: '',
				password: apiPassword
			},
			form: {
				path,
				size: size.toString(10)
			}
		});
	}

	async resizeStorageFolder(path, size) {
		const apiPassword = await this.getDefaultAPIPassword();

		return sendJSONRequest(`${this.config.siad_api_addr}/host/storage/folders/resize`, {
			method: 'POST',
			headers: {
				'User-Agent': this.config.siad_api_agent
			},
			auth: {
				username: '',
				password: apiPassword
			},
			form: {
				path,
				newsize: size.toString(10)
			}
		});
	}

	async removeStorageFolder(path, force) {
		const apiPassword = await this.getDefaultAPIPassword();

		const form = {
			path
		};

		if (force && typeof force === 'boolean')
			form.force = 'true';

		return sendJSONRequest(`${this.config.siad_api_addr}/host/storage/folders/remove`, {
			method: 'POST',
			headers: {
				'User-Agent': this.config.siad_api_agent
			},
			auth: {
				username: '',
				password: apiPassword
			},
			form
		});
	}
}