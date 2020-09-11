import path from 'path';
import process from 'process';
import { promises as fs } from 'fs';
import log from 'electron-log';
import { sendJSONRequest } from './common';
import { decode } from '@stablelib/utf8';

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

		if (this.config.siad_api_addr.indexOf('http') !== 0)
			this.config.siad_api_addr = `http://${this.config.siad_api_addr}`;

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

		try {
			const passwordFile = path.join(getDefaultSiaPath(), 'apipassword'),
				data = decode(await fs.readFile(passwordFile)).trim();

			this._defaultApiPassword = data;
		} catch (ex) {
			log.warn('SiaApiClient.getDefaultAPIPassword', ex);
		}

		return this._defaultApiPassword;
	}

	async walletUnlockConditions(addr) {
		const apiPassword = await this.getDefaultAPIPassword(),
			resp = await sendJSONRequest(`${this.config.siad_api_addr}/wallet/unlockconditions/${addr}`, {
				method: 'GET',
				headers: {
					'User-Agent': this.config.siad_api_agent
				},
				auth: {
					username: '',
					password: apiPassword
				}
			});

		if (resp.statusCode !== 200)
			throw new Error(resp.body.message);

		return resp.body;
	}

	async checkCredentials() {
		try {
			// hard coded address doesn't matter since we just want to check the API credentials
			const apiPassword = await this.getDefaultAPIPassword(),
				resp = await sendJSONRequest(`${this.config.siad_api_addr}/wallet/unlockconditions/2d6c6d705c80f17448d458e47c3fb1a02a24e018a82d702cda35262085a3167d98cc7a2ba339`, {
					method: 'GET',
					headers: {
						'User-Agent': this.config.siad_api_agent
					},
					auth: {
						username: '',
						password: apiPassword
					}
				});

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
		const apiPassword = await this.getDefaultAPIPassword(),
			resp = await sendJSONRequest(`${this.config.siad_api_addr}/daemon/version`, {
				method: 'GET',
				headers: {
					'User-Agent': this.config.siad_api_agent
				},
				auth: {
					username: '',
					password: apiPassword
				}
			});

		if (resp.statusCode !== 200)
			throw new Error(resp.body.message);

		return resp.body;
	}

	async stopDaemon() {
		const apiPassword = await this.getDefaultAPIPassword(),
			resp = await sendJSONRequest(`${this.config.siad_api_addr}/daemon/stop`, {
				method: 'GET',
				headers: {
					'User-Agent': this.config.siad_api_agent
				},
				auth: {
					username: '',
					password: apiPassword
				}
			});

		if (resp.statusCode !== 200)
			throw new Error(resp.body.message);

		return resp.body;
	}

	async getConsensus() {
		const apiPassword = await this.getDefaultAPIPassword(),
			resp = await sendJSONRequest(`${this.config.siad_api_addr}/consensus`, {
				method: 'GET',
				headers: {
					'User-Agent': this.config.siad_api_agent
				},
				auth: {
					username: '',
					password: apiPassword
				}
			});

		if (resp.statusCode !== 200)
			throw new Error(resp.body.message);

		return resp.body;
	}

	async getBlock(height) {
		const apiPassword = await this.getDefaultAPIPassword(),
			resp = await sendJSONRequest(`${this.config.siad_api_addr}/consensus/blocks?height=${height}`, {
				method: 'GET',
				headers: {
					'User-Agent': this.config.siad_api_agent
				},
				auth: {
					username: '',
					password: apiPassword
				}
			});

		if (resp.statusCode !== 200)
			throw new Error(resp.body.message);

		return resp.body;
	}

	async getLastBlock() {
		const consensus = await this.getConsensus();

		return this.getBlock(consensus.height);
	}

	async getGateway() {
		const apiPassword = await this.getDefaultAPIPassword(),
			resp = await sendJSONRequest(`${this.config.siad_api_addr}/gateway`, {
				method: 'GET',
				headers: {
					'User-Agent': this.config.siad_api_agent
				},
				auth: {
					username: '',
					password: apiPassword
				}
			});

		if (resp.statusCode !== 200)
			throw new Error(resp.body.message);

		return resp.body;
	}

	async getHostDB() {
		const apiPassword = await this.getDefaultAPIPassword(),
			resp = await sendJSONRequest(`${this.config.siad_api_addr}/hostdb`, {
				method: 'GET',
				headers: {
					'User-Agent': this.config.siad_api_agent
				},
				auth: {
					username: '',
					password: apiPassword
				}
			});

		if (resp.statusCode !== 200)
			throw new Error(resp.body.message);

		return resp.body;
	}

	async getHost() {
		const apiPassword = await this.getDefaultAPIPassword(),
			resp = await sendJSONRequest(`${this.config.siad_api_addr}/host`, {
				method: 'GET',
				headers: {
					'User-Agent': this.config.siad_api_agent
				},
				auth: {
					username: '',
					password: apiPassword
				}
			});

		if (resp.statusCode !== 200)
			throw new Error(resp.body.message);

		return resp.body;
	}

	async getHostContracts() {
		const apiPassword = await this.getDefaultAPIPassword(),
			resp = await sendJSONRequest(`${this.config.siad_api_addr}/host/contracts`, {
				method: 'GET',
				headers: {
					'User-Agent': this.config.siad_api_agent
				},
				auth: {
					username: '',
					password: apiPassword
				}
			});

		if (resp.statusCode !== 200)
			throw new Error(resp.body.message);

		return resp.body;
	}

	async getHostStorage() {
		const apiPassword = await this.getDefaultAPIPassword(),
			resp = await sendJSONRequest(`${this.config.siad_api_addr}/host/storage`, {
				method: 'GET',
				headers: {
					'User-Agent': this.config.siad_api_agent
				},
				auth: {
					username: '',
					password: apiPassword
				}
			});

		if (resp.statusCode !== 200)
			throw new Error(resp.body.message);

		return resp.body;
	}

	async getTransactionpoolFee() {
		const apiPassword = await this.getDefaultAPIPassword(),

			resp = await sendJSONRequest(`${this.config.siad_api_addr}/tpool/fee`, {
				method: 'GET',
				headers: {
					'User-Agent': this.config.siad_api_agent
				},
				auth: {
					username: '',
					password: apiPassword
				}
			});

		if (resp.statusCode !== 200)
			throw new Error(resp.body.message);

		return resp.body;
	}

	async getWallet() {
		const apiPassword = await this.getDefaultAPIPassword(),
			resp = await sendJSONRequest(`${this.config.siad_api_addr}/wallet`, {
				method: 'GET',
				headers: {
					'User-Agent': this.config.siad_api_agent
				},
				auth: {
					username: '',
					password: apiPassword
				}
			});

		if (resp.statusCode !== 200)
			throw new Error(resp.body.message);

		return resp.body;
	}

	async createWalletAddress() {
		const apiPassword = await this.getDefaultAPIPassword(),
			resp = await sendJSONRequest(`${this.config.siad_api_addr}/wallet/address`, {
				method: 'GET',
				headers: {
					'User-Agent': this.config.siad_api_agent
				},
				auth: {
					username: '',
					password: apiPassword
				}
			});

		if (resp.statusCode !== 200)
			throw new Error(resp.body.message);

		return resp.body;
	}

	async getWalletAddresses(count) {
		const apiPassword = await this.getDefaultAPIPassword(),
			resp = await sendJSONRequest(`${this.config.siad_api_addr}/wallet/seedaddrs?count=${count}`, {
				method: 'GET',
				headers: {
					'User-Agent': this.config.siad_api_agent
				},
				auth: {
					username: '',
					password: apiPassword
				}
			});

		if (resp.statusCode !== 200)
			throw new Error(resp.body.message);

		return resp.body;
	}

	async unlockWallet(encryptionpassword) {
		const apiPassword = await this.getDefaultAPIPassword(),
			resp = await sendJSONRequest(`${this.config.siad_api_addr}/wallet/unlock`, {
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

		if (resp.statusCode !== 200)
			throw new Error(resp.body.message);

		return resp.body;
	}

	async createWallet(encryptionpassword) {
		const apiPassword = await this.getDefaultAPIPassword(),
			resp = await sendJSONRequest(`${this.config.siad_api_addr}/wallet/init`, {
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

		if (resp.statusCode !== 200)
			throw new Error(resp.body.message);

		return resp.body;
	}

	async recoverWallet(seed, encryptionpassword) {
		const apiPassword = await this.getDefaultAPIPassword(),
			resp = await sendJSONRequest(`${this.config.siad_api_addr}/wallet/init/seed`, {
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

		if (resp.statusCode !== 200)
			throw new Error(resp.body.message);

		return resp.body;
	}

	async getTPoolFees() {
		const apiPassword = await this.getDefaultAPIPassword(),
			resp = await sendJSONRequest(`${this.config.siad_api_addr}/tpool/fee`, {
				method: 'GET',
				headers: {
					'User-Agent': this.config.siad_api_agent
				},
				auth: {
					username: '',
					password: apiPassword
				}
			});

		if (resp.statusCode !== 200)
			throw new Error(resp.body.message);

		return resp.body;
	}

	async announceHost(address) {
		const apiPassword = await this.getDefaultAPIPassword();

		const form = {};

		if (address && typeof address === 'string')
			form.netaddress = address;

		const resp = await sendJSONRequest(`${this.config.siad_api_addr}/host/announce`, {
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

		if (resp.statusCode !== 200)
			throw new Error(resp.body.message);

		return resp.body;
	}

	async updateHost(config) {
		const apiPassword = await this.getDefaultAPIPassword(),
			resp = await sendJSONRequest(`${this.config.siad_api_addr}/host`, {
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

		if (resp.statusCode !== 200)
			throw new Error(resp.body.message);

		return resp.body;
	}

	async addStorageFolder(path, size) {
		const apiPassword = await this.getDefaultAPIPassword(),
			resp = await sendJSONRequest(`${this.config.siad_api_addr}/host/storage/folders/add`, {
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

		if (resp.statusCode !== 200)
			throw new Error(resp.body.message);

		return resp.body;
	}

	async resizeStorageFolder(path, size) {
		const apiPassword = await this.getDefaultAPIPassword(),
			resp = await sendJSONRequest(`${this.config.siad_api_addr}/host/storage/folders/resize`, {
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

		if (resp.statusCode !== 200)
			throw new Error(resp.body.message);

		return resp.body;
	}

	async removeStorageFolder(path, force) {
		const apiPassword = await this.getDefaultAPIPassword();

		const form = {
			path
		};

		if (force && typeof force === 'boolean')
			form.force = 'true';

		const resp = await sendJSONRequest(`${this.config.siad_api_addr}/host/storage/folders/remove`, {
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

		if (resp.statusCode !== 200)
			throw new Error(resp.body.message);

		return resp.body;
	}

	async feeManagerPayoutHeight() {
		const apiPassword = await this.getDefaultAPIPassword(),
			{ body } = await sendJSONRequest(`${this.config.siad_api_addr}/feemanager`, {
				method: 'GET',
				auth: {
					username: '',
					password: apiPassword
				}
			});

		return body.payoutheight;
	}

	async addFee(amount, address, appID, recurring = false) {
		const apiPassword = await this.getDefaultAPIPassword(),
			{ body } = await sendJSONRequest(`${this.config.siad_api_addr}/feemanager/add`, {
				method: 'POST',
				auth: {
					username: '',
					password: apiPassword
				},
				form: {
					amount,
					address,
					recurring,
					appuid: appID
				}
			});

		return (await this.getPendingFees()).filter(f => f.feeiud === body.feeuid)[0];
	}

	async cancelFee(feeID) {
		const apiPassword = await this.getDefaultAPIPassword();

		await sendJSONRequest(`${this.config.siad_api_addr}/feemanager/cancel`, {
			method: 'POST',
			auth: {
				username: '',
				password: apiPassword
			},
			form: {
				feeuid: feeID
			}
		});
	}

	async getPendingFees(appID) {
		const apiPassword = await this.getDefaultAPIPassword(),
			resp = await sendJSONRequest(`${this.config.siad_api_addr}/feemanager/pendingfees`, {
				method: 'GET',
				auth: {
					username: '',
					password: apiPassword
				}
			});

		return (resp.body.pendingfees || []).filter(f => !appID || f.appuid === appID);
	}

	async getPaidFees(appID) {
		const apiPassword = await this.getDefaultAPIPassword(),
			resp = await sendJSONRequest(`${this.config.siad_api_addr}/feemanager/paidfees`, {
				method: 'GET',
				auth: {
					username: '',
					password: apiPassword
				}
			});

		return (resp.body.paidfees || []).filter(f => !appID || f.appuid === appID);
	}

	async sendSiacoins(amount, destination, feeIncluded = false) {
		const apiPassword = await this.getDefaultAPIPassword(),
			resp = await sendJSONRequest(`${this.config.siad_api_addr}/wallet/siacoins`, {
				method: 'POST',
				auth: {
					username: '',
					password: apiPassword
				},
				form: {
					amount,
					destination,
					feeIncluded
				}
			});

		if (resp.statusCode !== 200)
			throw new Error(resp.body.message);

		return (resp.body.transaction || []);
	}

	async sendSiacoinOutputs(outputs) {
		if (!Array.isArray(outputs))
			throw new Error('outputs should be an array');

		const apiPassword = await this.getDefaultAPIPassword(),
			resp = await sendJSONRequest(`${this.config.siad_api_addr}/wallet/siacoins`, {
				method: 'POST',
				auth: {
					username: '',
					password: apiPassword
				},
				form: {
					outputs: JSON.stringify(outputs)
				}
			});

		if (resp.statusCode !== 200)
			throw new Error(resp.body.message);

		return (resp.body.transaction || []);
	}
}