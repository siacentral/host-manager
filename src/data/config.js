import { BigNumber } from 'bignumber.js';

import { getHost } from '@/utils/sia';
import { getAverageSettings } from '@/utils/siacentral';
import Store from '@/store';

let refreshing = false;

export async function refreshHostConfig() {
	if (refreshing)
		return;

	try {
		refreshing = true;

		await Promise.all([
			loadAverageSettings(),
			loadHost()
		]);	
	} finally {
		refreshing = false;
	}
}

async function loadAverageSettings() {
	const resp = await getAverageSettings();

	if (resp.type !== 'success')
		throw new Error(resp.message);

	Store.dispatch('avgConfig/setMaxDuration', resp.settings.max_duration);
	Store.dispatch('avgConfig/setWindowSize', resp.settings.window_size);
	Store.dispatch('avgConfig/setMaxReviseSize', new BigNumber(resp.settings.max_revise_batch_size));
	Store.dispatch('avgConfig/setMaxDownloadSize', new BigNumber(resp.settings.max_download_batch_size));
	Store.dispatch('avgConfig/setContractPrice', new BigNumber(resp.settings.contract_price));
	Store.dispatch('avgConfig/setDownloadPrice', new BigNumber(resp.settings.download_price));
	Store.dispatch('avgConfig/setUploadPrice', new BigNumber(resp.settings.upload_price));
	Store.dispatch('avgConfig/setStoragePrice', new BigNumber(resp.settings.storage_price));
	Store.dispatch('avgConfig/setCollateral', new BigNumber(resp.settings.collateral));
	Store.dispatch('avgConfig/setMaxCollateral', new BigNumber(resp.settings.max_collateral));
	Store.dispatch('avgConfig/setBaseRPCPrice', new BigNumber(resp.settings.base_rpc_price));
	Store.dispatch('avgConfig/setSectorAccessPrice', new BigNumber(resp.settings.sector_access_price));
}

async function loadHost() {
	const resp = await getHost();

	if (resp.statusCode !== 200)
		throw new Error(resp.body.message);

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
}