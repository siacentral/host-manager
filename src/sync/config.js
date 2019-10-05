import log from 'electron-log';
import { BigNumber } from 'bignumber.js';

import { apiClient } from './index';
import Store from '@/store';

export async function refreshHostConfig() {
	try {
		const resp = await apiClient.getHost(),
			alerts = [];

		if (resp.statusCode !== 200)
			throw new Error(resp.body.message || 'unable to load host config');

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
	} catch (ex) {
		log.error('refreshHostConfig', ex.message);
	}
}
