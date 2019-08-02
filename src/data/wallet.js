import { BigNumber } from 'bignumber.js';
import log from 'electron-log';

import { apiClient } from './index';
import { sleep } from '@/utils';
import Store from '@/store';

export async function refreshHostWallet() {
	log.debug('refreshing host wallet');
	await loadHostWallet();
	log.debug('refreshed host wallet');
}

async function unlockHostWalllet(password) {
	try {
		log.info('attempting wallet unlock');
		const resp = await apiClient.unlockWallet(password);

		if (resp.statusCode !== 200)
			throw new Error(resp.body.message);

		return true;
	} catch (ex) {
		log.error(ex.message);

		return false;
	}
}

async function loadHostWallet(disableUnlock) {
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

	console.log(resp.body);

	if (!resp.body.unlocked) {
		alerts.push({
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
}