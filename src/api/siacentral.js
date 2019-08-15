import { sendJSONRequest } from './common';

export function getAverageSettings() {
	return sendJSONRequest(`${process.env.VUE_APP_API_BASE_URL}/explorer/hosts/average`, {
		method: 'GET'
	});
}

export function getConnectability(netaddress) {
	netaddress = encodeURIComponent(netaddress);

	return sendJSONRequest(`${process.env.VUE_APP_API_BASE_URL}/explorer/hosts/checkconnection?netaddress=${netaddress}`, {
		method: 'GET',
		timeout: 60000
	});
}

export function getConfirmedContracts(contracts) {
	return sendJSONRequest(`${process.env.VUE_APP_API_BASE_URL}/explorer/storage-obligations`, {
		method: 'POST',
		body: {
			contract_ids: contracts
		}
	});
}

export function getBlock(height) {
	let url = `${process.env.VUE_APP_API_BASE_URL}/explorer/block`;

	if (height)
		url += `?height=${height}`;

	return sendJSONRequest(url, {
		method: 'GET'
	});
}

export function getHost(netaddress) {
	netaddress = encodeURIComponent(netaddress);

	return sendJSONRequest(`${process.env.VUE_APP_API_BASE_URL}/explorer/hosts/search?net_address=${netaddress}`, {
		method: 'GET'
	});
}

export function getCoinPrice() {
	return sendJSONRequest('https://api.coingecko.com/api/v3/coins/siacoin?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false', {
		method: 'GET'
	});
}