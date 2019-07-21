import { BigNumber } from 'bignumber.js';

import { getWallet } from '@/utils/sia';
import Store from '@/store';

let refreshing = false;

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

async function loadHostWallet() {
	const resp = await getWallet();

	if (resp.statusCode !== 200)
		throw new Error(resp.body.message);

	Store.dispatch('hostWallet/setUnlocked', resp.body.unlocked);
	Store.dispatch('hostWallet/setEncrypted', resp.body.encrypted);
	Store.dispatch('hostWallet/setRescanning', resp.body.rescanning);
	Store.dispatch('hostWallet/setHeight', resp.body.height);
	Store.dispatch('hostWallet/setBalance', new BigNumber(resp.body.confirmedsiacoinbalance));
	Store.dispatch('hostWallet/setBalanceDelta', new BigNumber(resp.body.unconfirmedincomingsiacoins).minus(resp.body.unconfirmedoutgoingsiacoins));
}