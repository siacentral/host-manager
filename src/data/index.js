import { refreshBlockHeight, refreshLastBlock } from './consensus';
import { refreshHostConnectability } from './connection';
import { refreshHostContracts } from './contracts';
import { refreshHostStorage } from './storage';
import { refreshHostWallet } from './wallet';
import { refreshHostConfig } from './config';
import { getCoinPrice } from '@/utils/siacentral';
import Store from '@/store';

let refreshTimeout, loadingData, priceTimeout;

export async function refreshData() {
	if (loadingData)
		return;

	try {
		loadingData = true;

		clearTimeout(refreshTimeout);

		await refreshLastBlock();
		await Promise.all([
			refreshBlockHeight(),
			refreshHostConfig(),
			refreshHostWallet(),
			refreshHostContracts(),
			refreshHostStorage()
		]);

		await refreshHostConnectability();

		console.log('data refreshed', new Date());

		Store.dispatch('setLoaded', true);
	} catch (ex) {
		console.log(ex);
	} finally {
		refreshTimeout = setTimeout(refreshData, 1000 * 60 * 5);
		loadingData = false;
	}
}

async function refreshCoinPrice() {
	try {
		clearTimeout(priceTimeout);

		const price = await getCoinPrice();

		Store.dispatch('setCoinPrice', price.market_data.current_price);

		console.log(Store.state.coinPrice);
	} catch (ex) {
		console.log(ex);
	} finally {
		priceTimeout = setTimeout(refreshCoinPrice, 1000 * 60 * 30);
	}
}

refreshCoinPrice();