import { sendJSONRequest } from './common';

export function getLatestBootstrap(netaddress) {
	netaddress = encodeURIComponent(netaddress);

	return sendJSONRequest('https://siastats.info/bootstrap/metadata.json', {
		method: 'GET'
	});
}