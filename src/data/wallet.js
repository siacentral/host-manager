import { BigNumber } from 'bignumber.js';
import log from 'electron-log';

import { apiClient } from './index';
import Store from '@/store';

export async function refreshHostWallet() {
	try {
		await loadHostWallet();

		const walletExists = Store.state.hostWallet.encrypted,
			walletUnlocked = Store.state.hostWallet.unlocked || Store.state.hostWallet.rescanning;

		if (!walletExists) {
			Store.dispatch('setup/setFirstRun', true);
			Store.dispatch('setLoaded', false);
			return;
		}

		if (!walletUnlocked)
			unlockHostWallet(Store.state.config.siad_wallet_password);
	} catch (ex) {
		log.error('refreshHostWallet', ex.message);
	}
}

async function unlockHostWallet(password) {
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

export async function createWalletAddress() {
	try {
		const resp = await apiClient.createWalletAddress();

		if (resp.statusCode !== 200)
			throw new Error(resp.body.message);

		return resp.body.address;
	} catch (ex) {
		log.error('getLastWalletAddress', ex.message);
	}
}

async function loadHostWallet() {
	try {
		const resp = await apiClient.getWallet(),
			alerts = [];

		if (resp.statusCode !== 200)
			throw new Error(resp.body.message);

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