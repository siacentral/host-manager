import { sendJSONRequest } from './common';

export async function getAverageSettings() {
	const resp = await sendJSONRequest(`${process.env.VUE_APP_API_BASE_URL}/hostdb/average`, {
		method: 'GET'
	});

	return resp;
}

export async function getConnectability(netaddress) {
	netaddress = encodeURIComponent(netaddress);

	const resp = await sendJSONRequest(`${process.env.VUE_APP_API_BASE_URL}/hostdb/checkconnection?netaddress=${netaddress}`, {
		method: 'GET'
	});

	return resp;
}

export async function getConfirmedContracts(contracts) {
	const resp = await sendJSONRequest(`${process.env.VUE_APP_API_BASE_URL}/explorer/storage-obligations`, {
		method: 'POST',
		body: {
			contract_ids: contracts
		}
	});

	return resp;
}

export async function getBlock(height) {
	let url = `${process.env.VUE_APP_API_BASE_URL}/explorer/block`;

	if (height)
		url += `?height=${height}`;

	const resp = await sendJSONRequest(url, {
		method: 'GET'
	});

	return resp;
}

export function getCoinPrice() {
	return sendJSONRequest('https://api.coingecko.com/api/v3/coins/siacoin?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false', {
		method: 'GET'
	});
}