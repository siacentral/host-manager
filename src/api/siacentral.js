import { sendJSONRequest } from './common';

export function getAverageSettings() {
	return sendJSONRequest(`https://api.siacentral.com/api/v1/explorer/hosts/average`, {
		method: 'GET'
	});
}

export function getConnectability(netaddress) {
	netaddress = encodeURIComponent(netaddress);

	return sendJSONRequest(`https://api.siacentral.com/api/v1/explorer/hosts/checkconnection?netaddress=${netaddress}`, {
		method: 'GET',
		timeout: 60000
	});
}

export async function getBlock(height) {
	let url = `https://apidev.siacentral.com/v2/explorer/blocks`;

	if (height)
		url += `/${height}`;

	const resp = await sendJSONRequest(url, {
		method: 'GET'
	});

	if (resp.body.type !== 'success')
		throw new Error(resp.body.message || 'unable to get last block');

	return resp.body.block;
}

export async function getBlocks(heights) {
	const promises = [];

	for (let i = 0; i < heights.length; i += 5e3) {
		let end = i + 5e3;

		if (end >= heights.length)
			end = heights.length;

		promises.push(sendJSONRequest('https://apidev.siacentral.com/v2/explorer/blocks', {
			method: 'POST',
			body: {
				heights: heights.slice(i, end)
			}
		}));
	}

	const resps = await Promise.all(promises);
	let blocks = [];

	for (let i = 0; i < resps.length; i++) {
		if (resps[i].body.type !== 'success' || !Array.isArray(resps[i].body.blocks))
			throw new Error(resps[i].body.message || 'unable to get last block');

		blocks = blocks.concat(resps[i].body.blocks);
	}

	return blocks;
}

export function getHost(netaddress) {
	netaddress = encodeURIComponent(netaddress);

	return sendJSONRequest(`https://api.siacentral.com/api/v1/explorer/hosts/search?net_address=${netaddress}`, {
		method: 'GET'
	});
}

export function getCoinPrice() {
	return sendJSONRequest(`https://apidev.siacentral.com/v2/explorer/market/exchange-rate`, {
		method: 'GET'
	});
}

export function getSiaCentralBootstrap() {
	return sendJSONRequest(`https://api.siacentral.com/api/v1/bootstrap/latest`, {
		method: 'GET'
	});
}