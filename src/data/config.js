import { BigNumber } from 'bignumber.js';

import { apiClient } from './index';
import Store from '@/store';

let refreshing = false;

export async function refreshHostConfig() {
	if (refreshing)
		return;

	try {
		refreshing = true;

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
	} finally {
		refreshing = false;
	}
}
