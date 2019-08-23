import log from 'electron-log';
import { apiClient } from './index';
import { getBlock } from '@/api/siacentral';
import Store from '@/store';
import { launch } from '../utils/daemon';

let startTime, startBlock, finalBlock;

export async function refreshBlockHeight() {
	try {
		const resp = await apiClient.getConsensus();

		if (resp.statusCode !== 200)
			return;

		if (finalBlock > 0) {
			if (!startTime || !startBlock) {
				startTime = Date.now();
				startBlock = resp.body.height;
			}

			const syncedBlocks = resp.body.height - startBlock,
				blockTime = (Date.now() - startTime) / (syncedBlocks <= 0 ? 1 : syncedBlocks),
				remainingBlocks = finalBlock - resp.body.height;

			Store.dispatch('setSyncTime', remainingBlocks * blockTime);
		}

		Store.dispatch('setBlockHeight', resp.body.height);
		Store.dispatch('setSynced', resp.body.synced);
	} catch (ex) {
		log.error('refreshBlockHeight', ex.message);

		if (ex.message.indexOf('ECONNREFUSED') >= 0) {
			if (Store.state.hostDaemon.managed)
				return;

			log.error('daemon connection lost attempting reload');
			await launch(Store.state.config);
		}
	}
}

export async function refreshDaemonVersion() {
	try {
		const resp = await apiClient.getDaemonVersion();

		if (resp.statusCode !== 200)
			return;

		Store.dispatch('hostDaemon/setVersion', resp.body.version);
	} catch (ex) {
		log.error('refreshDaemonVersion', ex.message);
	}
}

export async function refreshLastBlock() {
	try {
		const resp = await getBlock();
		let height = 0;

		if (resp.body.type === 'success')
			height = resp.body.height;

		finalBlock = height;

		Store.dispatch('setLastBlock', height);
	} catch (ex) {
		log.error('refreshLastBlock', ex.message);
	}
}