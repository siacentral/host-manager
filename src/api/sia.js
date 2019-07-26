import path from 'path';
import request from 'request';
import { decode } from '@stablelib/utf8';
import log from 'electron-log';

import { readFileAsync, getDefaultSiaPath } from '@/utils/index';

let apiPassword;

// sends body as x-form-url-encoded instead of json
async function sendJSONRequest(url, opts) {
	await loadDefaultAPIPassword();

	return new Promise((resolve, reject) => {
		if (url.indexOf('http') < 0)
			url = `http://${url}`;

		request(url, opts, (err, resp, body) => {
			if (err)
				return reject(err);

			const r = { ...resp.toJSON() };

			try {
				r.body = JSON.parse(body);
			} catch (ex) {
				log.warn(ex.message);
			}

			if (r.statusCode >= 200 && r.statusCode < 300)
				r.statusCode = 200;

			resolve(r);
		});
	});
}

export default class SiaApiClient {
	constructor(opts) {
		opts = opts || {};

		this.config = {
			siad_api_addr: opts.siad_api_addr || 'localhost:9980',
			siad_api_agent: opts.siad_api_agent || 'Sia-Agent'
		};
	}

	async checkCredentials() {
		try {
			const resp = await this.getWalletAddress();

			if (resp.statusCode === 200)
				return true;

			if (resp.body.message && resp.body.message.indexOf('wallet must be unlocked before it can be used') >= 0)
				return true;
		} catch (ex) {}

		return false;
	}

	getDaemonVersion() {
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

	stopDaemon() {
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

	getConsensus() {
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

	getGateway() {
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

	getHostDB() {
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

	getHost() {
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

	getHostContracts() {
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

	getHostStorage() {
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

	getTransactionpoolFee() {
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

	getWallet() {
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

	getWalletAddress() {
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

	unlockWallet(encryptionpassword) {
		return sendJSONRequest(`${this.config.siad_api_addr}/wallet/unlock`, {
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

	createWallet(encryptionpassword) {
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

	recoverWallet(seed, encryptionpassword) {
		return sendJSONRequest(`${this.config.siad_api_addr}/wallet/init/seed`, 'POST', {
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

	announceHost(address) {
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

	updateHost(config) {
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

	addStorageFolder(path, size) {
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

	resizeStorageFolder(path, size) {
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

	removeStorageFolder(path, force) {
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

export async function getAPIPassword() {
	await loadDefaultAPIPassword();

	return apiPassword;
}

async function loadDefaultAPIPassword() {
	if (apiPassword)
		return;

	if (process.env.SIA_API_PASSWORD && process.env.SIA_API_PASSWORD.length > 0) {
		apiPassword = process.env.SIA_API_PASSWORD;

		return;
	}

	const passwordFile = path.join(getDefaultSiaPath(), 'apipassword'),
		data = decode(await readFileAsync(passwordFile)).trim();

	apiPassword = data;
}