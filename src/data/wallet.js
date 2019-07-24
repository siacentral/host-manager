import { BigNumber } from 'bignumber.js';

import { getWallet, unlockWallet } from '@/utils/sia';
import Store from '@/store';

let refreshing = false, unlocking = false, disableUnlock = false;

export async function refreshHostWallet() {
	if (refreshing)
		return;

	try {
		refreshing = true;

		await loadHostWallet();
	} finally {
		refreshing = false;
	}
}

async function unlockHostWalllet() {
	if (unlocking || disableUnlock)
		return;

	try {
		unlocking = true;

		const resp = await unlockWallet();

		if (resp.statusCode !== 200)
			throw new Error(resp.body.message);
	} catch (ex) {
		console.log(ex);
		disableUnlock = true;
	} finally {
		unlocking = false;
	}
}

async function loadHostWallet() {
	const config = Store.state.config || {},
		resp = await getWallet();

	if (resp.statusCode !== 200)
		throw new Error(resp.body.message);

	if (!resp.body.unlocked && resp.body.encrypted && !resp.body.rescanning && config.siad_wallet_password && !disableUnlock) {
		await unlockHostWalllet();
		await loadHostWallet();
		return;
	}

	Store.dispatch('hostWallet/setUnlocked', resp.body.unlocked);
	Store.dispatch('hostWallet/setEncrypted', resp.body.encrypted);
	Store.dispatch('hostWallet/setRescanning', resp.body.rescanning);
	Store.dispatch('hostWallet/setHeight', resp.body.height);
	Store.dispatch('hostWallet/setBalance', new BigNumber(resp.body.confirmedsiacoinbalance));
	Store.dispatch('hostWallet/setBalanceDelta', new BigNumber(resp.body.unconfirmedincomingsiacoins).minus(resp.body.unconfirmedoutgoingsiacoins));
}