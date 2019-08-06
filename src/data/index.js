import log from 'electron-log';

import { refreshBlockHeight, refreshLastBlock, refreshDaemonVersion } from './consensus';
import { refreshHostContracts } from './contracts';
import { refreshHostStorage } from './storage';
import { refreshHostWallet } from './wallet';
import { refreshHostConfig } from './config';
import { refreshExplorer } from './explorer';
import { getCoinPrice } from '@/api/siacentral';
import Store from '@/store';
import SiaApiClient from '@/api/sia';

let longTimeout, shortTimeout, loadingLong, loadingShort, priceTimeout;

export const apiClient = new SiaApiClient(Store.state.config);

export async function refreshData() {
	if (!(await apiClient.checkCredentials()))
		throw new Error('API credentials invalid');

	await refreshCoinPrice();
	await longRefresh();
	await shortRefresh();

	Store.dispatch('setLoaded', true);
}

async function shortRefresh() {
	if (loadingShort)
		return;

	try {
		loadingShort = true;

		clearTimeout(shortTimeout);

		await Promise.all([
			refreshDaemonVersion(),
			refreshBlockHeight(),
			refreshHostWallet(),
			refreshHostStorage()
		]);
	} catch (ex) {
		log.error('data refresh - short', ex.message);
	} finally {
		loadingShort = false;
		shortTimeout = setTimeout(shortRefresh, 5000);
	}
}

async function longRefresh() {
	if (loadingLong)
		return;

	try {
		loadingLong = true;

		clearTimeout(longTimeout);

		await Promise.all([
			refreshHostConfig(),
			refreshLastBlock()
		]);

		await refreshExplorer();
		await refreshHostContracts();
	} catch (ex) {
		log.error('data refresh - long', ex.message);
	} finally {
		loadingLong = false;
		longTimeout = setTimeout(longRefresh, 300000);
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
		log.error('coingecko refresh', ex.message);
	} finally {
		priceTimeout = setTimeout(refreshCoinPrice, 1000 * 60 * 30);
	}
}