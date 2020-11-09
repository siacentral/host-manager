import log from 'electron-log';
import { BigNumber } from 'bignumber.js';

import { apiClient } from './index';
import Store from '@/store';

export async function refreshHostConfig() {
	try {
		const host = await apiClient.getHost(),
			alerts = [],
			config = {
				acceptingcontracts: host.internalsettings.acceptingcontracts,
				netaddress: host.internalsettings.netaddress,
				maxduration: host.internalsettings.maxduration,
				windowsize: host.internalsettings.windowsize,
				maxrevisebatchsize: new BigNumber(host.internalsettings.maxrevisebatchsize),
				maxdownloadbatchsize: new BigNumber(host.internalsettings.maxdownloadbatchsize),
				mincontractprice: new BigNumber(host.internalsettings.mincontractprice),
				mindownloadbandwidthprice: new BigNumber(host.internalsettings.mindownloadbandwidthprice),
				minuploadbandwidthprice: new BigNumber(host.internalsettings.minuploadbandwidthprice),
				minstorageprice: new BigNumber(host.internalsettings.minstorageprice),
				collateral: new BigNumber(host.internalsettings.collateral),
				maxcollateral: new BigNumber(host.internalsettings.maxcollateral),
				collateralbudget: new BigNumber(host.internalsettings.collateralbudget),
				minbaserpcprice: new BigNumber(host.internalsettings.minbaserpcprice),
				minsectoraccessprice: new BigNumber(host.internalsettings.minsectoraccessprice),
				registrysize: new BigNumber(host.internalsettings.registrysize),
				customregistrypath: host.internalsettings.customregistrypath
			};

		if (config.maxcollateral.lte(0)) {
			console.log('fixing max collateral');
			apiClient.updateHost({
				maxcollateral: config.collateral.times(4320).times(1e12).times(4).toFixed(0).toString(10)
			});
			await refreshHostConfig();
			return;
		}

		if (!host.internalsettings.acceptingcontracts) {
			alerts.push({
				severity: 'warning',
				category: 'configuration',
				message: 'You are not currently accepting new contracts',
				icon: 'wrench'
			});
		}

		const lockedCollateral = new BigNumber(host.financialmetrics.lockedstoragecollateral),
			collateralBudget = new BigNumber(host.internalsettings.collateralbudget).times(0.9);

		if (lockedCollateral.gte(collateralBudget)) {
			alerts.push({
				severity: 'danger',
				category: 'configuration',
				message: 'Your locked collateral is over your collateral budget. Try restarting your host to clear stale contracts or increase your collateral budget',
				icon: 'wrench'
			});
		}

		Store.dispatch('setNetAddress', host.externalsettings.netaddress);
		Store.dispatch('hostConfig/setAlerts', alerts);
		Store.dispatch('hostConfig/setConfig', config);
		Store.dispatch('hostConfig/setPriceTable', host.pricetable);
	} catch (ex) {
		log.error('refreshHostConfig', ex.message);
	}
}
