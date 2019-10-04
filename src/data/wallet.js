import { BigNumber } from 'bignumber.js';
import log from 'electron-log';

import { apiClient } from './index';
import Store from '@/store';

export async function refreshHostWallet() {
	try {
		await loadHostWallet();

		const walletExists = Store.state.hostWallet.encrypted,
			walletUnlocked = Store.state.hostWallet.encrypted && Store.state.hostWallet.unlocked;

		if (!walletExists) {
			Store.dispatch('setup/setFirstRun', true);
			Store.dispatch('setLoaded', false);
			return;
		}

		if (!walletUnlocked && !Store.state.hostWallet.rescanning) {
			await unlockHostWallet(Store.state.config.siad_wallet_password);
			await loadHostWallet();
		} else if (walletUnlocked && !Store.state.hostWallet.rescanning)
			await loadWalletAddress();
	} catch (ex) {
		log.error('refreshHostWallet', ex.message);
	}
}

async function loadWalletAddress() {
	try {
		if (typeof Store.state.hostWallet.lastAddress === 'string' && Store.state.hostWallet.lastAddress.trim().length !== 0)
			return;

		let resp = await apiClient.getWalletAddresses(1);

		if (resp.statusCode !== 200)
			throw new Error(resp.body.message || 'unable to load seed address');

		let address = Array.isArray(resp.body.addresses) ? resp.body.addresses[0] : null;

		if (typeof address !== 'string' || address.trim().length === 0) {
			address = await createWalletAddress();
			log.info('loadWalletAddress', 'created new wallet address');
		}

		Store.dispatch('hostWallet/setLastAddress', address);
	} catch (ex) {
		log.error('loadWalletAddress', ex.message);
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

		const confirmedBalance = new BigNumber(resp.body.confirmedsiacoinbalance),
			balanceDelta = new BigNumber(resp.body.unconfirmedincomingsiacoins).minus(resp.body.unconfirmedoutgoingsiacoins);

		// make sure we have more than 1 SC in the wallet
		if (confirmedBalance.lte(1e24)) {
			alerts.push({
				category: 'wallet',
				severity: 'danger',
				icon: 'wallet',
				message: 'Wallet has no funds. Host will not be able to accept contracts or submit storage proofs.'
			});
		}

		Store.dispatch('hostWallet/setAlerts', alerts);
		Store.dispatch('hostWallet/setUnlocked', resp.body.unlocked);
		Store.dispatch('hostWallet/setEncrypted', resp.body.encrypted);
		Store.dispatch('hostWallet/setRescanning', resp.body.rescanning);
		Store.dispatch('hostWallet/setHeight', resp.body.height);
		Store.dispatch('hostWallet/setBalance', confirmedBalance);
		Store.dispatch('hostWallet/setBalanceDelta', balanceDelta);
	} catch (ex) {
		log.error('loadHostWallet', ex.message);
	}
}