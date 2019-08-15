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
import SiaApiClient from '@/api/sia';

let longTimeout, shortTimeout, loadingLong, loadingShort, priceTimeout;

export const apiClient = new SiaApiClient(Store.state.config);

export async function refreshData() {
	if (!(await apiClient.checkCredentials()))
		throw new Error('API credentials invalid');

	await longRefresh();
	await shortRefresh();
	await refreshCoinPrice();

	Store.dispatch('setLoaded', true);
}

async function shortRefresh() {
	if (loadingShort)
		return;

	try {
		loadingShort = true;

		clearTimeout(shortTimeout);

		await refreshDaemonVersion();
		await refreshBlockHeight();
		await refreshHostWallet();
		await refreshHostStorage();
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

		await refreshLastBlock();
		await refreshHostConfig();
		await refreshHostContracts();
		await refreshExplorer();
	} catch (ex) {
		log.error('data refresh - long', ex.message);
	} finally {
		loadingLong = false;
		longTimeout = setTimeout(longRefresh, 300000);
	}
}

function getSCValue(key, pin) {
	const { value, currency } = pin;

	switch (key) {
	// per tb / month
	case 'minstorageprice':
	case 'collateral':
		return parseCurrencyString(value, currency).div(1e12).div(4320);
	// per tb
	case 'mindownloadbandwidthprice':
	case 'minuploadbandwidthprice':
		return parseCurrencyString(value, currency).div(1e12);
	// sc
	default:
		return parseCurrencyString(value, currency);
	}
}

async function updatePinnedPricing() {
	try {
		if (!Store.state.config.host_pricing_pins)
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

		const resp = await apiClient.updateHost(newConfig);

		if (resp.statusCode !== 200)
			throw new Error(resp.body.message || 'unable to set pinned pricing');

		await refreshHostConfig();
	} catch (ex) {
		log.error('update pinned pricing', ex.message);
	}
}

async function refreshCoinPrice() {
	try {
		clearTimeout(priceTimeout);

		const resp = await getCoinPrice();

		if (resp.statusCode !== 200)
			return;

		Store.dispatch('setCoinPrice', resp.body.market_data.current_price);

		await updatePinnedPricing(Store.state.hostConfig.config);
	} catch (ex) {
		log.error('coingecko refresh', ex.message);
	} finally {
		priceTimeout = setTimeout(refreshCoinPrice, 1000 * 60 * 15);
	}
}