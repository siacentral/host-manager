import log from 'electron-log';
import { BigNumber } from 'bignumber.js';

import Store from '@/store';
import { apiClient } from './index';
import { getBlock, getBlocks } from '@/api/siacentral';
import { formatPriceString, formatFriendlyStatus } from '@/utils/format';

export async function refreshHostContracts() {
	try {
		await parseHostContracts();
	} catch (ex) {
		log.error('refreshHostContracts', ex.message);
	}
}

function calcBlockTimestamp(currentBlock, height) {
	const diff = currentBlock.height - height,
		minutes = 10 * diff,
		timestamp = new Date(currentBlock.timestamp);

	timestamp.setMinutes(timestamp.getMinutes() - minutes);

	return timestamp;
}

function addContractStats(stats, contract) {
	const currentDate = new Date(),
		days30Ago = new Date(),
		days60Ago = new Date(),
		days30Future = new Date(),
		days60Future = new Date();

	days30Ago.setDate(currentDate.getDate() - 30);
	days60Ago.setDate(currentDate.getDate() - 60);
	days30Future.setDate(currentDate.getDate() + 30);
	days60Future.setDate(currentDate.getDate() + 60);

	try {
		switch (contract.status.toLowerCase()) {
		case 'obligationunresolved':
			if (contract.unused)
				stats.contracts.unused++;
			else
				stats.contracts.active++;

			if (contract.expiration_timestamp <= days30Future) {
				stats.potential_revenue.days_30 = stats.potential_revenue.days_30.plus(contract.total_revenue);
				stats.contracts.next_30_days++;
			}

			if (contract.expiration_timestamp <= days60Future) {
				stats.potential_revenue.days_60 = stats.potential_revenue.days_60.plus(contract.total_revenue);
				stats.contracts.next_60_days++;
			}

			stats.potential_revenue.total = stats.potential_revenue.total.plus(contract.total_revenue);
			stats.potential_revenue.upload = stats.potential_revenue.upload.plus(contract.upload_revenue);
			stats.potential_revenue.download = stats.potential_revenue.download.plus(contract.download_revenue);
			stats.potential_revenue.storage = stats.potential_revenue.storage.plus(contract.storage_revenue);
			stats.potential_revenue.contract_fees = stats.potential_revenue.contract_fees.plus(contract.contract_cost);
			stats.potential_revenue.transaction_fees = stats.potential_revenue.transaction_fees.plus(contract.transaction_fees);
			stats.locked_collateral = stats.locked_collateral.plus(contract.locked_collateral);
			stats.risked_collateral = stats.risked_collateral.plus(contract.risked_collateral);

			break;
		case 'obligationsucceeded':
			if (!contract.unused)
				stats.contracts.successful++;

			if (contract.expiration_timestamp > days30Ago) {
				stats.earned_revenue.days_30 = stats.earned_revenue.days_30.plus(contract.total_revenue);
				stats.contracts.past_30_days++;
			}

			if (contract.expiration_timestamp > days60Ago) {
				stats.earned_revenue.days_60 = stats.earned_revenue.days_60.plus(contract.total_revenue);
				stats.contracts.past_60_days++;
			}

			stats.earned_revenue.total = stats.earned_revenue.total.plus(contract.total_revenue);
			stats.earned_revenue.upload = stats.earned_revenue.upload.plus(contract.upload_revenue);
			stats.earned_revenue.download = stats.earned_revenue.download.plus(contract.download_revenue);
			stats.earned_revenue.storage = stats.earned_revenue.storage.plus(contract.storage_revenue);
			stats.earned_revenue.contract_fees = stats.earned_revenue.contract_fees.plus(contract.contract_cost);
			stats.earned_revenue.transaction_fees = stats.earned_revenue.transaction_fees.plus(contract.transaction_fees);
			break;
		case 'obligationfailed':
			stats.contracts.failed++;

			if (contract.expiration_timestamp > days30Ago) {
				stats.lost_revenue.days_30 = stats.lost_revenue.days_30.plus(contract.total_revenue);
				stats.contracts.past_30_days++;
			}

			if (contract.expiration_timestamp > days60Ago) {
				stats.lost_revenue.days_60 = stats.lost_revenue.days_60.plus(contract.total_revenue);
				stats.contracts.past_60_days++;
			}

			stats.lost_revenue.total = stats.lost_revenue.total.plus(contract.total_revenue);
			stats.lost_revenue.upload = stats.lost_revenue.upload.plus(contract.upload_revenue);
			stats.lost_revenue.download = stats.lost_revenue.download.plus(contract.download_revenue);
			stats.lost_revenue.storage = stats.lost_revenue.storage.plus(contract.storage_revenue);
			stats.lost_revenue.contract_fees = stats.lost_revenue.contract_fees.plus(contract.contract_cost);
			stats.lost_revenue.transaction_fees = stats.lost_revenue.transaction_fees.plus(contract.transaction_fees);
			stats.lost_collateral = stats.lost_collateral.plus(contract.risked_collateral);
			break;
		}
	} catch (ex) {
		log.error('addContractStats', ex);
	}
}

export async function parseHostContracts() {
	const stats = {
		contracts: {
			total: 0,
			unused: 0,
			active: 0,
			failed: 0,
			successful: 0,
			next_30_days: 0,
			next_60_days: 0,
			past_30_days: 0,
			past_60_days: 0
		},
		potential_revenue: {
			total: new BigNumber(0),
			storage: new BigNumber(0),
			upload: new BigNumber(0),
			download: new BigNumber(0),
			contract_fees: new BigNumber(0),
			transaction_fees: new BigNumber(0),
			days_30: new BigNumber(0),
			days_60: new BigNumber(0)
		},
		earned_revenue: {
			total: new BigNumber(0),
			storage: new BigNumber(0),
			upload: new BigNumber(0),
			download: new BigNumber(0),
			contract_fees: new BigNumber(0),
			transaction_fees: new BigNumber(0),
			days_30: new BigNumber(0),
			days_60: new BigNumber(0)
		},
		lost_revenue: {
			total: new BigNumber(0),
			storage: new BigNumber(0),
			upload: new BigNumber(0),
			download: new BigNumber(0),
			contract_fees: new BigNumber(0),
			transaction_fees: new BigNumber(0),
			days_30: new BigNumber(0),
			days_60: new BigNumber(0)
		},
		locked_collateral: new BigNumber(0),
		risked_collateral: new BigNumber(0),
		lost_collateral: new BigNumber(0)
	};

	try {
		const currentBlock = await getBlock(),
			alerts = [],
			invalidStatusMap = {},
			requiredBlocks = [];

		const filtered = (await loadHostContracts()).reduce((confirmed, c) => {
			if ((!c.originconfirmed && !c.proofconfirmed && !c.revisionconfirmed) || !c.transactionid || c.transactionid.length === 0)
				return confirmed;

			const contract = {
				id: c.obligationid,
				transaction_id: c.transactionid,
				contract_cost: new BigNumber(c.contractcost),
				transaction_fees: new BigNumber(c.transactionfeesadded),
				data_size: new BigNumber(c.datasize),
				locked_collateral: new BigNumber(c.lockedcollateral),
				risked_collateral: new BigNumber(c.riskedcollateral),
				storage_revenue: new BigNumber(c.potentialstoragerevenue),
				download_revenue: new BigNumber(c.potentialdownloadrevenue),
				upload_revenue: new BigNumber(c.potentialuploadrevenue),
				sector_count: c.sectorrootscount,
				negotiation_height: c.negotiationheight,
				expiration_height: c.expirationheight,
				proof_deadline: c.proofdeadline,
				sia_status: c.obligationstatus,
				confirmed: c.originconfirmed,
				proof_confirmed: c.proofconfirmed,
				proof_constructed: c.proofconstructed,
				revision_confirmed: c.revisionconfirmed,
				revision_constructed: c.revisionconstructed,
				tags: []
			};

			contract.unused = contract.data_size.eq(0) && contract.storage_revenue.eq(0);

			if (contract.negotiation_height < currentBlock.height && requiredBlocks.indexOf(contract.negotiation_height) === -1)
				requiredBlocks.push(contract.negotiation_height);

			if (contract.expiration_height < currentBlock.height && requiredBlocks.indexOf(contract.expiration_height) === -1)
				requiredBlocks.push(contract.expiration_height);

			if (contract.proof_deadline < currentBlock.height && requiredBlocks.indexOf(contract.proof_deadline) === -1)
				requiredBlocks.push(contract.proof_deadline);

			contract.total_revenue = contract.storage_revenue.plus(contract.download_revenue)
				.plus(contract.upload_revenue).plus(contract.contract_cost);

			if (contract.sia_status.toLowerCase() === 'obligationunresolved' && contract.proof_deadline < currentBlock.height) {
				if (contract.proof_confirmed)
					contract.status = 'obligationSucceeded';
				else {
					contract.status = 'obligationFailed';
					contract.tags.push({
						severity: 'severe',
						text: 'Proof Not Submitted'
					});
				}

				const key = `${contract.status}-${contract.sia_status}`;

				if (!invalidStatusMap[key])
					invalidStatusMap[key] = 0;

				invalidStatusMap[key] += 1;

				contract.tags.push({
					severity: 'warning',
					text: 'Status Mismatch'
				});
			} else
				contract.status = contract.sia_status;

			confirmed.push(contract);

			return confirmed;
		}, []);

		const blocks = await getBlocks(requiredBlocks),
			blockMap = {};

		blockMap[currentBlock.height] = currentBlock;

		for (let i = 0; i < blocks.length; i++)
			blockMap[blocks[i].height] = blocks[i];

		filtered.forEach(contract => {
			const negotiationBlock = blockMap[contract.negotiation_height],
				expirationBlock = blockMap[contract.expiration_height],
				proofDeadlineBlock = blockMap[contract.proof_deadline];

			contract.negotation_timestamp = new Date(negotiationBlock.timestamp);

			if (expirationBlock)
				contract.expiration_timestamp = new Date(expirationBlock.timestamp);
			else
				contract.expiration_timestamp = calcBlockTimestamp(currentBlock, contract.expiration_height);

			if (proofDeadlineBlock)
				contract.proof_deadline_timestamp = new Date(proofDeadlineBlock.timestamp);
			else
				contract.proof_deadline_timestamp = calcBlockTimestamp(currentBlock, contract.proof_deadline);

			addContractStats(stats, contract);
		});

		stats.contracts.total = stats.contracts.active + stats.contracts.unused + stats.contracts.failed + stats.contracts.successful;

		if (stats.contracts.failed > 0) {
			let prefix;

			if (stats.contracts.failed === 1)
				prefix = `${stats.contracts.failed} contract has`;
			else
				prefix = `${stats.contracts.failed} contracts have`;

			alerts.push({
				id: `${prefix}_failed_contracts`,
				severity: 'danger',
				category: 'contracts',
				message: `${prefix} failed resulting in ${formatPriceString(stats.lost_revenue.total.plus(stats.lost_collateral))} of lost revenue and burnt collateral. Check the contracts page and your logs for more details`,
				icon: 'file-contract'
			});
		}

		for (let key in invalidStatusMap) {
			const count = invalidStatusMap[key];

			if (isNaN(count) || !isFinite(count) || count <= 0)
				continue;

			const statuses = key.split('-'),
				actualStatus = formatFriendlyStatus(statuses[0].trim()),
				siaStatus = formatFriendlyStatus(statuses[1].trim());
			let prefix;

			if (count === 1)
				prefix = `${count} contract is`;
			else
				prefix = `${count} contracts are`;

			alerts.push({
				category: 'contracts',
				message: `Sia shows ${prefix} ${siaStatus} but should be ${actualStatus}.`,
				icon: 'file-contract',
				severity: 'warning'
			});
		}

		Store.dispatch('hostContracts/setAlerts', alerts);
		Store.dispatch('hostContracts/setContracts', filtered);
	} catch (ex) {
		log.error('parseHostContracts', ex.message);
	} finally {
		Store.dispatch('hostContracts/setStats', stats);
	}
}

async function loadHostContracts() {
	const resp = await apiClient.getHostContracts();

	if (resp.statusCode !== 200)
		throw new Error(resp.body.error);

	return resp.body.contracts || [];
}