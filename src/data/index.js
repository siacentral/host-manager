import log from 'electron-log';

import { refreshBlockHeight, refreshLastBlock } from './consensus';
import { refreshHostContracts } from './contracts';
import { refreshHostStorage } from './storage';
import { refreshHostWallet } from './wallet';
import { refreshHostConfig } from './config';
import { refreshExplorer } from './explorer';
import { getCoinPrice } from '@/api/siacentral';
import Store from '@/store';
import SiaApiClient from '@/api/sia';

let refreshTimeout, loadingData, priceTimeout;

export const apiClient = new SiaApiClient(Store.state.config);

export async function refreshData() {
	if (loadingData)
		return;

	try {
		loadingData = true;

		clearTimeout(refreshTimeout);

		if (!(await apiClient.checkCredentials()))
			throw new Error('API credentials invalid');

		await refreshLastBlock();
		await Promise.all([
			refreshBlockHeight(),
			refreshHostConfig(),
			refreshHostWallet(),
			refreshHostContracts(),
			refreshHostStorage()
		]);

		await refreshExplorer();

		Store.dispatch('setLoaded', true);

		refreshTimeout = setTimeout(refreshData, 1000 * 60 * 5);
	} finally {
		loadingData = false;
	}
}

async function refreshCoinPrice() {
	try {
		clearTimeout(priceTimeout);

		const resp = await getCoinPrice();

		if (resp.statusCode !== 200)
			return;

		Store.dispatch('setCoinPrice', resp.body.market_data.current_price);
	} catch (ex) {
		log.error(ex.message);
	} finally {
		priceTimeout = setTimeout(refreshCoinPrice, 1000 * 60 * 30);
	}
}

refreshCoinPrice();