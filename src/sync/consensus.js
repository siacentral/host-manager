import log from 'electron-log';
import { apiClient } from './index';
import { getBlock } from '@/api/siacentral';
import Store from '@/store';
import { launch } from '@/sync/daemon';

let startTime, startBlock;

export async function refreshBlockHeight() {
	try {
		const consensus = await apiClient.getConsensus(),
			remoteBlock = await getBlock(),
			targetHeight = remoteBlock.height;

		// sanity check; should never happen
		if (targetHeight <= consensus.height)
			Store.dispatch('setSyncTime', 0);
		else {
			if (!startTime || !startBlock) {
				startTime = Date.now();
				startBlock = consensus.height;
			}

			const syncedBlocks = consensus.height - startBlock,
				blockTime = (Date.now() - startTime) / (syncedBlocks <= 0 ? 1 : syncedBlocks);
			let remainingBlocks = targetHeight - consensus.height;

			if (remainingBlocks < 0)
				remainingBlocks = 0;

			Store.dispatch('setSyncTime', remainingBlocks * blockTime);
		}

		Store.dispatch('setBlock', {
			hash: consensus.currentblock,
			height: consensus.height,
			target: targetHeight
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

export async function refreshLastBlock() {
	try {
		const alerts = [],
			lastSyncedBlock = (await apiClient.getConsensus()).height;

		if (lastSyncedBlock <= 6)
			return;

		const remoteBlock = await getBlock(lastSyncedBlock - 6),
			localBlock = await apiClient.getBlock(lastSyncedBlock - 6);

		if (remoteBlock.id !== localBlock.id) {
			alerts.push({
				category: 'consensus',
				icon: 'redo',
				severity: 'danger',
				message: 'You do not appear to be synced to the Sia network.' +
					' You may need to resync the consensus.'
			});
		}

		Store.dispatch('setLastBlock', remoteBlock.height);
		Store.dispatch('setAlerts', alerts);
	} catch (ex) {
		log.error('refreshLastBlock', ex.message);
	}
}
