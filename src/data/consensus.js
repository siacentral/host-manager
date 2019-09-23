import log from 'electron-log';
import { apiClient } from './index';
import { getBlock } from '@/api/siacentral';
import Store from '@/store';
import { launch } from '@/data/daemon';

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

		Store.dispatch('setBlock', {
			hash: resp.body.currentblock,
			height: resp.body.height
		});
		Store.dispatch('setSynced', resp.body.synced);
	} catch (ex) {
		log.error('refreshBlockHeight', ex.message);

		if (ex.message.indexOf('ECONNREFUSED') >= 0) {
			log.error('daemon connection lost attempting reload');
			launch(Store.state.config);
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

async function getLocalHash(height) {
	const resp = await apiClient.getBlock(height);

	if (resp.statusCode !== 200)
		throw new Error(resp.body.message || `unable to get block ${height}`);

	return resp.body.id;
}

export async function checkConsensusSync() {
	const alerts = [];

	try {
		if (!Store.state.block || Store.state.block.height === 0)
			return;

		// the block hash returned by /consensus does not always match up with the current block height
		// to work around this we need to specifically request the hash of the current block height.
		const { height } = JSON.parse(JSON.stringify(Store.state.block)),
			localHash = await getLocalHash(height),
			resp = await getBlock(height);

		if (resp.body.type !== 'success')
			throw new Error(resp.body.message);

		console.log(height, localHash, resp.body.block.id);

		if (localHash === resp.body.block.id)
			return;

		alerts.push({
			category: 'consensus',
			icon: 'redo',
			severity: 'danger',
			message: 'You do not appear to be synced to the Sia network.' +
				' You may need to resync the consensus.'
		});
	} catch (ex) {
		log.error('checkConsensusSync', ex.message);
	} finally {
		Store.dispatch('setAlerts', alerts);
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