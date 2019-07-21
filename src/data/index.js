import { refreshBlockHeight, refreshLastBlock } from './consensus';
import { refreshHostConnectability } from './connection';
import { refreshHostContracts } from './contracts';
import { refreshHostStorage } from './storage';
import { refreshHostWallet } from './wallet';
import { refreshHostConfig } from './config';
import { getCoinPrice } from '@/utils/siacentral';
import { getWalletAddress } from '@/utils/sia';
import Store from '@/store';

let refreshTimeout, loadingData, priceTimeout;

export async function refreshData() {
	if (loadingData)
		return;

	try {
		loadingData = true;

		clearTimeout(refreshTimeout);

		try {
			// used to detect whether the api address and api password work properly
			const resp = await getWalletAddress();

			if (resp.statusCode !== 200)
				throw new Error(resp.body.message || 'Unable to connect');
		} catch (ex) {
			if (ex.message.indexOf('wallet must be unlocked before it can be used') < 0)
				throw new Error(ex.message);
		}

		await refreshLastBlock();
		await Promise.all([
			refreshBlockHeight(),
			refreshHostConfig(),
			refreshHostWallet(),
			refreshHostContracts(),
			refreshHostStorage()
		]);

		await refreshHostConnectability();

		Store.dispatch('setLoaded', true);

		refreshTimeout = setTimeout(refreshData, 1000 * 60 * 5);
	} finally {
		loadingData = false;
	}
}

async function refreshCoinPrice() {
	try {
		clearTimeout(priceTimeout);

		const price = await getCoinPrice();

		Store.dispatch('setCoinPrice', price.market_data.current_price);
	} catch (ex) {
		console.log(ex);
	} finally {
		priceTimeout = setTimeout(refreshCoinPrice, 1000 * 60 * 30);
	}
}

refreshCoinPrice();