import { BigNumber } from 'bignumber.js';

import { getAverageSettings, getHost, getConnectability } from '@/api/siacentral';
import Store from '@/store';

let refreshing = false;

export async function refreshExplorer() {
	if (refreshing)
		return;

	try {
		refreshing = true;

		await Promise.all([
			loadAverageSettings(),
			loadExplorerHost(),
			checkHostConnectability()
		]);
	} finally {
		refreshing = false;
	}
}

export async function checkHostConnectability() {
	const resp = await getConnectability(Store.state.netAddress);

	Store.dispatch('hostConnection/setConnectability', resp.body);
}

async function loadExplorerHost() {
	const resp = await getHost(Store.state.netAddress);

	if (resp.body.type !== 'success')
		throw new Error(resp.body.message);

	if (resp.body.host.settings) {
		resp.body.host.settings = {
			netaddress: resp.body.host.settings.netaddress,
			version: resp.body.host.settings.version,
			accepting_contracts: resp.body.host.settings.accepting_contracts,
			max_download_batch_size: resp.body.host.settings.max_download_batch_size,
			max_duration: resp.body.host.settings.max_duration,
			max_revise_batch_size: resp.body.host.settings.max_revise_batch_size,
			remaining_storage: resp.body.host.settings.remaining_storage,
			sector_size: resp.body.host.settings.sector_size,
			total_storage: resp.body.host.settings.total_storage,
			window_size: resp.body.host.settings.window_size,
			revision_number: resp.body.host.settings.revision_number,
			base_rpc_price: new BigNumber(resp.body.host.settings.base_rpc_price),
			collateral: new BigNumber(resp.body.host.settings.collateral),
			max_collateral: new BigNumber(resp.body.host.settings.max_collateral),
			contract_price: new BigNumber(resp.body.host.settings.contract_price),
			download_price: new BigNumber(resp.body.host.settings.download_price),
			sector_access_price: new BigNumber(resp.body.host.settings.sector_access_price),
			storage_price: new BigNumber(resp.body.host.settings.storage_price),
			upload_price: new BigNumber(resp.body.host.settings.upload_price)
		};
	}

	Store.dispatch('explorer/setHost', resp.body.host);
}

async function loadAverageSettings() {
	const resp = await getAverageSettings();

	if (resp.body.type !== 'success')
		throw new Error(resp.body.message);

	const settings = {
		max_duration: resp.body.settings.max_duration,
		window_size: resp.body.settings.window_size,
		max_revise_batch_size: new BigNumber(resp.body.settings.max_revise_batch_size),
		max_download_batch_size: new BigNumber(resp.body.settings.max_download_batch_size),
		contract_price: new BigNumber(resp.body.settings.contract_price),
		download_price: new BigNumber(resp.body.settings.download_price),
		upload_price: new BigNumber(resp.body.settings.upload_price),
		storage_price: new BigNumber(resp.body.settings.storage_price),
		collateral: new BigNumber(resp.body.settings.collateral),
		max_collateral: new BigNumber(resp.body.settings.max_collateral),
		base_rpc_price: new BigNumber(resp.body.settings.base_rpc_price),
		sector_access_price: new BigNumber(resp.body.settings.sector_access_price)
	};

	Store.dispatch('explorer/setAverageSettings', settings);
}