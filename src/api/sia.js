import log from 'electron-log';

import { getDefaultAPIPassword } from '@/utils';
import { sendJSONRequest } from './common';

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
		} catch (ex) {
			log.error('checking credentials', ex.message);
		}

		return false;
	}

	async getDaemonVersion() {
		const apiPassword = await getDefaultAPIPassword();

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
		const apiPassword = await getDefaultAPIPassword();

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
		const apiPassword = await getDefaultAPIPassword();

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

	async getGateway() {
		const apiPassword = await getDefaultAPIPassword();

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
		const apiPassword = await getDefaultAPIPassword();

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
		const apiPassword = await getDefaultAPIPassword();

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
		const apiPassword = await getDefaultAPIPassword();

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
		const apiPassword = await getDefaultAPIPassword();

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
		const apiPassword = await getDefaultAPIPassword();

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
		const apiPassword = await getDefaultAPIPassword();

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

	async getWalletAddress() {
		const apiPassword = await getDefaultAPIPassword();

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

	async unlockWallet(encryptionpassword) {
		const apiPassword = await getDefaultAPIPassword();

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

	async createWallet(encryptionpassword) {
		const apiPassword = await getDefaultAPIPassword();

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
		const apiPassword = await getDefaultAPIPassword();

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

	async announceHost(address) {
		const apiPassword = await getDefaultAPIPassword();

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
		const apiPassword = await getDefaultAPIPassword();

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
		const apiPassword = await getDefaultAPIPassword();

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
		const apiPassword = await getDefaultAPIPassword();

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
		const apiPassword = await getDefaultAPIPassword();

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