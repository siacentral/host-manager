export async function sendJSONRequest(url, method, data, headers) {
	const opts = {
		method,
		headers,
		cache: 'no-cache',
		body: data ? JSON.stringify(data) : null
	};

	const r = await fetch(url, opts),
		resp = await r.json();

	return resp;
}

export async function getAverageSettings() {
	const resp = await sendJSONRequest(`${process.env.VUE_APP_API_BASE_URL}/hostdb/average`, 'GET', null);

	return resp;
}

export async function getConnectability(netaddress) {
	netaddress = encodeURIComponent(netaddress);

	const resp = await sendJSONRequest(`${process.env.VUE_APP_API_BASE_URL}/hostdb/checkconnection?netaddress=${netaddress}`, 'GET', null);

	return resp;
}

export async function getConfirmedContracts(contracts) {
	const resp = await sendJSONRequest(`${process.env.VUE_APP_API_BASE_URL}/explorer/storage-obligations`, 'POST', {
		contract_ids: contracts
	});

	return resp;
}

export async function getBlock(height) {
	let url = `${process.env.VUE_APP_API_BASE_URL}/explorer/block`;

	if (height)
		url += `?height=${height}`;

	const resp = await sendJSONRequest(url, 'GET', null);

	return resp;
}

export function getCoinPrice() {
	return sendJSONRequest('https://api.coingecko.com/api/v3/coins/siacoin?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false', 'GET', null);
}