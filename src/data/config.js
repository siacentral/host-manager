import { BigNumber } from 'bignumber.js';

import { apiClient } from './index';
import Store from '@/store';

let refreshing = false;

export async function refreshHostConfig() {
	if (refreshing)
		return;

	try {
		refreshing = true;

		const resp = await apiClient.getHost();

		if (resp.statusCode !== 200)
			throw new Error(resp.body.message || 'unable to load host config');

		Store.dispatch('setNetAddress', resp.body.externalsettings.netaddress);
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
