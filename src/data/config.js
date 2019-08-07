import log from 'electron-log';
import { BigNumber } from 'bignumber.js';

import { apiClient } from './index';
import { parseCurrencyString } from '@/utils/parse';
import Store from '@/store';

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

async function updatePinnedPricing(existingConfig) {
	let changed = false,
		newConfig = {};

	for (let pin in Store.state.config.host_pricing_pins) {
		try {
			const newValue = getSCValue(pin, Store.state.config.host_pricing_pins[pin]).toFixed(0),
				currentValue = existingConfig[pin];

			if (newValue === currentValue)
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
}

export async function refreshHostConfig(skipPins) {
	const resp = await apiClient.getHost(),
		alerts = [];

	if (resp.statusCode !== 200)
		throw new Error(resp.body.message || 'unable to load host config');

	if (Store.state.config.host_pricing_pins && !skipPins) {
		try {
			await updatePinnedPricing(resp.body.internalsettings);
		} catch (ex) {
			alerts.push({
				severity: 'danger',
				category: 'configuration',
				message: ex.message,
				icon: 'wrench'
			});
		}

		await refreshHostConfig(true);
		return;
	}

	if (!resp.body.internalsettings.acceptingcontracts) {
		alerts.push({
			severity: 'warning',
			category: 'configuration',
			message: 'You are not currently accepting new contracts',
			icon: 'wrench'
		});
	}

	const lockedCollateral = new BigNumber(resp.body.financialmetrics.lockedstoragecollateral),
		collateralBudget = new BigNumber(resp.body.internalsettings.collateralbudget).times(0.9);

	if (lockedCollateral.gte(collateralBudget)) {
		alerts.push({
			severity: 'danger',
			category: 'configuration',
			message: 'Your locked collateral is over your collateral budget. Try restarting your host to clear stale contracts or increase your collateral budget',
			icon: 'wrench'
		});
	}

	Store.dispatch('setNetAddress', resp.body.externalsettings.netaddress);
	Store.dispatch('hostConfig/setAlerts', alerts);
	Store.dispatch('hostConfig/setConfig', {
		acceptingcontracts: resp.body.internalsettings.acceptingcontracts,
		netaddress: resp.body.internalsettings.netaddress,
		maxduration: resp.body.internalsettings.maxduration,
		windowsize: resp.body.internalsettings.windowsize,
		maxrevisebatchsize: new BigNumber(resp.body.internalsettings.maxrevisebatchsize),
		maxdownloadbatchsize: new BigNumber(resp.body.internalsettings.maxdownloadbatchsize),
		mincontractprice: new BigNumber(resp.body.internalsettings.mincontractprice),
		mindownloadbandwidthprice: new BigNumber(resp.body.internalsettings.mindownloadbandwidthprice),
		minuploadbandwidthprice: new BigNumber(resp.body.internalsettings.minuploadbandwidthprice),
		minstorageprice: new BigNumber(resp.body.internalsettings.minstorageprice),
		collateral: new BigNumber(resp.body.internalsettings.collateral),
		maxcollateral: new BigNumber(resp.body.internalsettings.maxcollateral),
		collateralbudget: new BigNumber(resp.body.internalsettings.collateralbudget),
		minbaserpcprice: new BigNumber(resp.body.internalsettings.minbaserpcprice),
		minsectoraccessprice: new BigNumber(resp.body.internalsettings.minsectoraccessprice)
	});
}
