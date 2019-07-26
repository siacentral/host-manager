import request from 'request';

// sends body as JSON instead of url-encoded form
async function sendJSONRequest(url, method, body) {
	return new Promise((resolve, reject) => {
		const opts = {
			method
		};

		if (method === 'POST' && body)
			opts.body = JSON.stringify(body);

		request(url, opts, (err, resp, body) => {
			if (err)
				return reject(err);

			const r = { ...resp.toJSON() };

			try {
				r.body = JSON.parse(body);
			} catch (ex) {}

			if (r.statusCode >= 200 && r.statusCode < 300)
				r.statusCode = 200;

			resolve(r);
		});
	});
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