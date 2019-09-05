import { sendJSONRequest } from './common';

export function getSiaStatsBootstrap(netaddress) {
	netaddress = encodeURIComponent(netaddress);

	return sendJSONRequest('https://siastats.info/bootstrap/metadata.json', {
		method: 'GET'
	});
}