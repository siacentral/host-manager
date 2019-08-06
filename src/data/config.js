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
	Store.dispatch('hostConfig/setAcceptingContracts', resp.body.internalsettings.acceptingcontracts);
	Store.dispatch('hostConfig/setNetAddress', resp.body.internalsettings.netaddress);
	Store.dispatch('hostConfig/setMaxDuration', resp.body.internalsettings.maxduration);
	Store.dispatch('hostConfig/setWindowSize', resp.body.internalsettings.windowsize);
	Store.dispatch('hostConfig/setMaxReviseSize', new BigNumber(resp.body.internalsettings.maxrevisebatchsize));
	Store.dispatch('hostConfig/setMaxDownloadSize', new BigNumber(resp.body.internalsettings.maxdownloadbatchsize));
	Store.dispatch('hostConfig/setContractPrice', new BigNumber(resp.body.internalsettings.mincontractprice));
	Store.dispatch('hostConfig/setDownloadPrice', new BigNumber(resp.body.internalsettings.mindownloadbandwidthprice));
	Store.dispatch('hostConfig/setUploadPrice', new BigNumber(resp.body.internalsettings.minuploadbandwidthprice));
	Store.dispatch('hostConfig/setStoragePrice', new BigNumber(resp.body.internalsettings.minstorageprice));
	Store.dispatch('hostConfig/setCollateral', new BigNumber(resp.body.internalsettings.collateral));
	Store.dispatch('hostConfig/setMaxCollateral', new BigNumber(resp.body.internalsettings.maxcollateral));
	Store.dispatch('hostConfig/setCollateralBudget', new BigNumber(resp.body.internalsettings.collateralbudget));
	Store.dispatch('hostConfig/setBaseRPCPrice', new BigNumber(resp.body.internalsettings.minbaserpcprice));
	Store.dispatch('hostConfig/setSectorAccessPrice', new BigNumber(resp.body.internalsettings.minsectoraccessprice));
}
