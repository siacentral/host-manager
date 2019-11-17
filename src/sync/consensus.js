import log from 'electron-log';
import { apiClient } from './index';
import { getBlock } from '@/api/siacentral';
import Store from '@/store';
import { launch } from '@/sync/daemon';

let startTime, startBlock, finalBlock;

export async function refreshBlockHeight() {
	try {
		const consensus = await apiClient.getConsensus();

		if (finalBlock > 0) {
			if (!startTime || !startBlock) {
				startTime = Date.now();
				startBlock = consensus.height;
			}

			const syncedBlocks = consensus.height - startBlock,
				blockTime = (Date.now() - startTime) / (syncedBlocks <= 0 ? 1 : syncedBlocks),
				remainingBlocks = finalBlock - consensus.height;

			Store.dispatch('setSyncTime', remainingBlocks * blockTime);
		}

		Store.dispatch('setBlock', {
			hash: consensus.currentblock,
			height: consensus.height
		});
		Store.dispatch('setSynced', consensus.synced);
	} catch (ex) {
		log.error('refreshBlockHeight', ex.message);

		if (ex.message.indexOf('ECONNREFUSED') >= 0) {
			log.error('daemon connection lost attempting reload');
			launch();
		}
	}
}

export async function refreshDaemonVersion() {
	try {
		const daemon = await apiClient.getDaemonVersion();

		Store.dispatch('hostDaemon/setVersion', daemon.version);
	} catch (ex) {
		log.error('refreshDaemonVersion', ex.message);
	}
}

export async function checkConsensusSync() {
	const alerts = [];

	try {
		if (!Store.state.block || Store.state.block.height === 0)
			return;

		const remoteBlock = await getBlock(),
			localBlock = await apiClient.getBlock(remoteBlock.height);

		if (remoteBlock.id === localBlock.id)
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
		const block = await getBlock();

		Store.dispatch('setLastBlock', block.height);
	} catch (ex) {
		log.error('refreshLastBlock', ex.message);
	}
}