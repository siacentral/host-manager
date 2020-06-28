import log from 'electron-log';

import { refreshBlockHeight, refreshLastBlock, refreshDaemonVersion } from './consensus';
import { refreshHostContracts } from './contracts';
import { refreshHostStorage } from './storage';
import { refreshHostWallet } from './wallet';
import { refreshHostConfig } from './config';
import { refreshExplorer } from './explorer';
import { getCoinPrice } from '@/api/siacentral';
import { parseCurrencyString } from '@/utils/parse';
import Store from '@/store';
import SiaApiClient from '@/sia/api';

let longTimeout, shortTimeout, loadingLong, loadingShort, priceTimeout;

export let apiClient;

export async function refreshData(config) {
	apiClient = new SiaApiClient(config || Store.state.config);
	const credentialsValid = await apiClient.checkCredentials();

	if (!credentialsValid)
		throw new Error('API credentials invalid');

	Store.dispatch('setRefreshingData', true);

	await refreshLastBlock();
	await longRefresh();
	await shortRefresh();
	await refreshCoinPrice();

	Store.dispatch('setLoaded', true);
	Store.dispatch('setRefreshingData', false);
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
			refreshLastBlock(),
			refreshHostConfig(),
			refreshHostContracts()
		]);

		// refresh explorer relies on host config call being completed
		await refreshExplorer();
	} catch (ex) {
		log.error('data refresh - long', ex.message);
	} finally {
		loadingLong = false;
		longTimeout = setTimeout(longRefresh, 300000);
	}
}

function getSCValue(key, pin) {
	const byteFactor = Store.state.config && Store.state.config.data_unit === 'decimal' ? 1e12 : 1099511627776;

	const { value, currency } = pin;

	switch (key) {
	// per tb / month
	case 'minstorageprice':
	case 'collateral':
		return parseCurrencyString(value, currency).div(byteFactor).div(4320);
	// per tb
	case 'mindownloadbandwidthprice':
	case 'minuploadbandwidthprice':
		return parseCurrencyString(value, currency).div(byteFactor);
	// sc
	default:
		return parseCurrencyString(value, currency);
	}
}

async function updatePinnedPricing() {
	try {
		if (Date.now() - parseInt(localStorage.getItem('lastPinRefresh'), 10) <= 8.64e+7)
			return;

		if (!Store.state.config || !Store.state.config.host_pricing_pins)
			return;

		let changed = false,
			newConfig = {};

		for (let pin in Store.state.config.host_pricing_pins) {
			try {
				if (!Store.state.config.host_pricing_pins || !Store.state.config.host_pricing_pins[pin] ||
					typeof Store.state.config.host_pricing_pins[pin].value !== 'string')
					continue;

				const newValue = getSCValue(pin, Store.state.config.host_pricing_pins[pin]).toFixed(0),
					currentValue = Store.state.hostConfig.config[pin].toFixed(0);

				if (currentValue === undefined || newValue === undefined || newValue === currentValue)
					continue;

				log.debug('updated', pin, 'from', currentValue, 'to', newValue);

				newConfig[pin] = newValue;
				changed = true;
			} catch (ex) {
				log.error('unable to set pricing for', pin, ex.message);
				throw new Error(`unable to set pricing for ${pin}. Check error logs for more information.`);
			}
		}

		if (!changed)
			return true;

		await apiClient.updateHost(newConfig);
		localStorage.setItem('lastPinRefresh', Date.now().toString());
		await refreshHostConfig();
	} catch (ex) {
		log.error('update pinned pricing', ex.message);
	}
}

async function refreshCoinPrice() {
	try {
		clearTimeout(priceTimeout);

		const prices = await getCoinPrice();

		Store.dispatch('setCoinPrice', prices);
		await updatePinnedPricing();
	} catch (ex) {
		log.error('refreshCoinPrice', ex.message);
	} finally {
		priceTimeout = setTimeout(refreshCoinPrice, 1000 * 60 * 15);
	}
}