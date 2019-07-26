import { apiClient } from './index';
import { getBlock } from '@/api/siacentral';
import Store from '@/store';

let startTime, startBlock, finalBlock;

export async function refreshBlockHeight() {
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
}

export async function refreshLastBlock() {
	const resp = await getBlock();
	let height = 0;

	if (resp.body.type === 'success')
		height = resp.body.height;

	finalBlock = height;

	Store.dispatch('setLastBlock', height);
}

setInterval(async() => {
	try {
		await refreshBlockHeight();
	} catch (ex) {
		Store.dispatch('setCriticalError', ex.message);
	}
}, 15 * 1000);