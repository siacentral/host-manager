'use strict';

import Store from '@/store';
import request from 'request';

function sendJSONRequest(url, method, body) {
	return new Promise((resolve, reject) => {
		url = `${Store.state.config.siad_api_addr || 'localhost:9980'}${url}`;

		if (url.indexOf('http') < 0)
			url = `http://${url}`;

		const opts = {
			method,
			headers: {
				'User-Agent': Store.state.config.siad_api_agent || 'Sia-Agent'
			},
			auth: {
				username: '',
				password: Store.state.config.siad_api_password
			}
		};

		if (method === 'POST' && body)
			opts.form = body;

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

export function getConsensus() {
	return sendJSONRequest('/consensus', 'GET', null);
}

export function getContracts() {
	return sendJSONRequest('/host/contracts', 'GET', null);
}

export function getHost() {
	return sendJSONRequest('/host', 'GET', null);
}

export function getHostStorage() {
	return sendJSONRequest('/host/storage', 'GET', null);
}

export function getWallet() {
	return sendJSONRequest('/wallet', 'GET', null);
}

export function getWalletAddress() {
	return sendJSONRequest('/wallet/address', 'GET', null);
}

export function unlockWallet(password) {
	return sendJSONRequest('/wallet/unlock', 'POST', {
		encryptionpassword: password
	});
}

export function createWallet(encryptionpassword) {
	return sendJSONRequest('/wallet/init', 'POST', {
		encryptionpassword
	});
}

export function recoverWallet(seed, encryptionpassword) {
	return sendJSONRequest('/wallet/init/seed', 'POST', {
		encryptionpassword,
		seed
	});
}

export function announceHost(address) {
	const body = {};

	if (address && typeof address === 'string')
		body.netaddress = address;

	return sendJSONRequest('/host/announce', 'POST', body);
}

export function updateHost(config) {
	return sendJSONRequest('/host', 'POST', config);
}

export function addStorageFolder(path, size) {
	return sendJSONRequest('/host/storage/folders/add', 'POST', {
		path,
		size: size.toString(10)
	});
}

export function resizeStorageFolder(path, size) {
	return sendJSONRequest('/host/storage/folders/resize', 'POST', {
		path,
		newsize: size.toString(10)
	});
}

export function removeStorageFolder(path, force) {
	const opts = {
		path
	};

	if (force && typeof force === 'boolean')
		opts['force'] = 'true';

	return sendJSONRequest('/host/storage/folders/remove', 'POST', opts);
}