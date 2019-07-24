'use strict';

import Store from '@/store';
import request from 'request';
import path from 'path';
import { decode } from '@stablelib/utf8';

import { readFileAsync, getDefaultSiaPath } from './index';

let apiPassword;

export async function getAPIPassword() {
	await loadDefaultAPIPassword();

	return apiPassword;
}

async function loadDefaultAPIPassword() {
	if (apiPassword)
		return;

	if (process.env.SIA_API_PASSWORD && process.env.SIA_API_PASSWORD.length > 0) {
		apiPassword = process.env.SIA_API_PASSWORD;

		return;
	}

	const passwordFile = path.join(getDefaultSiaPath(), 'apipassword'),
		data = decode(await readFileAsync(passwordFile)).trim();

	apiPassword = data;
}

async function sendJSONRequest(url, method, body) {
	const config = Store.state.config || {};

	await loadDefaultAPIPassword();

	return new Promise((resolve, reject) => {
		url = `${config.siad_api_addr || 'localhost:9980'}${url}`;

		if (url.indexOf('http') < 0)
			url = `http://${url}`;

		const opts = {
			method,
			headers: {
				'User-Agent': config.siad_api_agent || 'Sia-Agent'
			},
			auth: {
				username: '',
				password: apiPassword
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

export function getDaemonVersion() {
	return sendJSONRequest('/daemon/version', 'GET', null);
}

export function stopDaemon() {
	return sendJSONRequest('/daemon/stop', 'GET', null);
}

export function getConsensus() {
	return sendJSONRequest('/consensus', 'GET', null);
}

export function getGateway() {
	return sendJSONRequest('/gateway', 'GET', null);
}

export function getHostDB() {
	return sendJSONRequest('/hostdb', 'GET', null);
}

export function getHost() {
	return sendJSONRequest('/host', 'GET', null);
}

export function getHostContracts() {
	return sendJSONRequest('/host/contracts', 'GET', null);
}

export function getHostStorage() {
	return sendJSONRequest('/host/storage', 'GET', null);
}

export function getTransactionpoolFee() {
	return sendJSONRequest('/tpool/fee', 'GET', null);
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