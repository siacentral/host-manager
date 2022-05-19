import { sendJSONRequest } from './common';

export async function getAverageSettings() {
	const resp = await sendJSONRequest('https://api.siacentral.com/v2/hosts/network/averages', {
		method: 'GET'
	});

	if (resp.statusCode !== 200 || resp.body.type !== 'success')
		throw new Error(resp.body.message);

	return resp.body.settings;
}

export async function getConnectability(netaddress) {
	netaddress = encodeURIComponent(netaddress);

	const resp = await sendJSONRequest(`https://api.siacentral.com/v2/troubleshoot/${netaddress}`, {
		method: 'GET',
		timeout: 60000
	});

	if (resp.statusCode !== 200)
		throw new Error(resp.body.message);

	return resp.body.report;
}

export async function getHost(netaddress) {
	netaddress = encodeURIComponent(netaddress);

	const resp = await sendJSONRequest(`https://api.siacentral.com/v2/hosts/${netaddress}`, {
		method: 'GET'
	});

	if (resp.statusCode !== 200 || resp.body.type !== 'success')
		throw new Error(resp.body.message);

	return resp.body.host;
}

export async function getSiaCentralBootstrap() {
	const resp = await sendJSONRequest('https://api.siacentral.com/v2/bootstrap/latest', {
		method: 'GET'
	});

	if (resp.statusCode !== 200 || resp.body.type !== 'success')
		throw new Error(resp.body.message);

	return resp.body.snapshot;
}

export async function getBlock(height) {
	let url = 'https://api.siacentral.com/v2/explorer/blocks';

	if (height)
		url += `/${height}`;

	const resp = await sendJSONRequest(url, {
		method: 'GET'
	});

	if (resp.statusCode !== 200 || resp.body.type !== 'success')
		throw new Error(resp.body.message || 'unable to get last block');

	return resp.body.block;
}

export async function getContracts(ids, currency = 'usd') {
	const contracts = [];

	for (let i = 0; i < ids.length; i += 500) {
		const resp = await sendJSONRequest(`https://api.siacentral.com/v2/explorer/contracts?currency=${currency}`, {
			method: 'POST',
			body: {
				contracts: ids.slice(i, i + 500)
			}
		});

		if (resp.statusCode !== 200 || resp.body.type !== 'success' || !Array.isArray(resp.body.contracts))
			throw new Error(resp.body.message);

		contracts.push(...resp.body.contracts);
	}

	return contracts;
}

export async function getCoinPrice() {
	const resp = await sendJSONRequest('https://api.siacentral.com/v2/market/exchange-rate?currencies=sc', {
		method: 'GET'
	});

	if (resp.statusCode !== 200)
		throw new Error(resp.body.message);

	if (!resp.body.rates || !resp.body.rates.sc)
		throw new Error('unrecognized response');

	return resp.body.rates.sc;
}

export async function getBootstrapPeers() {
	const resp = await fetch('https://api.siacentral.com/v2/scanner'),
		body = await resp.text();

	if (resp.status !== 200)
		throw new Error(body);

	return body.split('\n').map(p => p.trim());
}