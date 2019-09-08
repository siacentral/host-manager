import { BigNumber } from 'bignumber.js';
import log from 'electron-log';

import { apiClient } from './index';
import { sleep } from '@/utils';
import Store from '@/store';

export async function refreshHostWallet() {
	try {
		await Promise.all([
			loadHostWallet(),
			loadWalletAddress(),
			loadWalletFees()
		]);

		if (!Store.state.hostWallet.unlocked && !Store.state.hostWallet.encrypted &&
			!Store.state.hostWallet.scanning) {
			Store.dispatch('setup/setFirstRun', true);
			Store.dispatch('setLoaded', false);
			return;
		}

		if (!Store.state.lastAddress) {
			await apiClient.createWalletAddress();
			await loadWalletAddress();
		}
	} catch (ex) {
		log.error('refreshHostWallet', ex.message);
	}
}

async function unlockHostWalllet(password) {
	try {
		const resp = await apiClient.unlockWallet(password);

		if (resp.statusCode !== 200)
			throw new Error(resp.body.message);

		return true;
	} catch (ex) {
		log.error('data unlock wallet', ex.message);

		return false;
	}
}

async function loadWalletFees() {
	try {
		const resp = await apiClient.getWalletAddresses();

		if (resp.statusCode !== 200)
			throw new Error(resp.body.message);

		if (!Array.isArray(resp.body.addresses))
			throw new Error('addresses must be an array');

		Store.dispatch('hostWallet/setFees', {
			maximum: new BigNumber(resp.body.maximum),
			minimum: new BigNumber(resp.body.minimum)
		});
	} catch (ex) {
		log.error('loadWalletFees', ex.message);
	}
}

async function loadWalletAddress() {
	try {
		const resp = await apiClient.getWalletAddresses();

		if (resp.statusCode !== 200)
			throw new Error(resp.body.message);

		Store.dispatch('hostWallet/setLastAddress', resp.body.addresses[resp.body.addresses.length - 1]);
	} catch (ex) {
		log.error('loadWalletAddress', ex.message);
	}
}

async function loadHostWallet(disableUnlock) {
	try {
		const config = Store.state.config || {},
			resp = await apiClient.getWallet(),
			alerts = [];

		if (resp.statusCode !== 200)
			throw new Error(resp.body.message);

		if (!resp.body.unlocked && resp.body.encrypted && !resp.body.rescanning && config.siad_wallet_password && !disableUnlock) {
			unlockHostWalllet(config.siad_wallet_password);
			await sleep(1);
			await loadHostWallet(true);
			return;
		}

		if (!resp.body.unlocked) {
			alerts.push({
				category: 'wallet',
				severity: 'danger',
				icon: 'wallet',
				message: 'Wallet is not unlocked. Wallet must be unlocked to form new contracts'
			});
		}

		if (resp.body.rescanning) {
			alerts.push({
				category: 'wallet',
				severity: 'warning',
				icon: 'wallet',
				message: 'Wallet is rescanning. Host will not be able to form contracts until completed'
			});
		}

		Store.dispatch('hostWallet/setAlerts', alerts);
		Store.dispatch('hostWallet/setUnlocked', resp.body.unlocked);
		Store.dispatch('hostWallet/setEncrypted', resp.body.encrypted);
		Store.dispatch('hostWallet/setRescanning', resp.body.rescanning);
		Store.dispatch('hostWallet/setHeight', resp.body.height);
		Store.dispatch('hostWallet/setBalance', new BigNumber(resp.body.confirmedsiacoinbalance));
		Store.dispatch('hostWallet/setBalanceDelta', new BigNumber(resp.body.unconfirmedincomingsiacoins).minus(resp.body.unconfirmedoutgoingsiacoins));
	} catch (ex) {
		log.error('loadHostWallet', ex.message);
	}
}