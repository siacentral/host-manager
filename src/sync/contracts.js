import log from 'electron-log';
import { BigNumber } from 'bignumber.js';

import Store from '@/store';
import { apiClient } from './index';
import { getContracts } from '@/api/siacentral';
import { formatPriceString, formatFriendlyStatus } from '@/utils/format';

export async function refreshHostContracts() {
	try {
		await parseHostContracts();
	} catch (ex) {
		log.error('refreshHostContracts', ex.message);
	}
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
				stats.potential_revenue.days_30 = stats.potential_revenue.days_30.plus(contract.potential_revenue);
				stats.contracts.next_30_days++;
			}

			if (contract.expiration_timestamp <= days60Future) {
				stats.potential_revenue.days_60 = stats.potential_revenue.days_60.plus(contract.potential_revenue);
				stats.contracts.next_60_days++;
			}

			stats.potential_revenue.total = stats.potential_revenue.total.plus(contract.potential_revenue);
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
				stats.earned_revenue.days_30 = stats.earned_revenue.days_30.plus(contract.earned_revenue);
				stats.contracts.past_30_days++;
			}

			if (contract.expiration_timestamp > days60Ago) {
				stats.earned_revenue.days_60 = stats.earned_revenue.days_60.plus(contract.earned_revenue);
				stats.contracts.past_60_days++;
			}

			stats.earned_revenue.total = stats.earned_revenue.total.plus(contract.earned_revenue);
			stats.earned_revenue.upload = stats.earned_revenue.upload.plus(contract.upload_revenue);
			stats.earned_revenue.download = stats.earned_revenue.download.plus(contract.download_revenue);
			stats.earned_revenue.storage = stats.earned_revenue.storage.plus(contract.storage_revenue);
			stats.earned_revenue.contract_fees = stats.earned_revenue.contract_fees.plus(contract.contract_cost);
			stats.earned_revenue.transaction_fees = stats.earned_revenue.transaction_fees.plus(contract.transaction_fees);
			break;
		case 'obligationfailed':
			stats.contracts.failed++;

			if (contract.expiration_timestamp > days30Ago) {
				stats.lost_revenue.days_30 = stats.lost_revenue.days_30.plus(contract.lost_revenue);
				stats.contracts.past_30_days++;
			}

			if (contract.expiration_timestamp > days60Ago) {
				stats.lost_revenue.days_60 = stats.lost_revenue.days_60.plus(contract.lost_revenue);
				stats.contracts.past_60_days++;
			}

			stats.lost_revenue.total = stats.lost_revenue.total.plus(contract.lost_revenue);
			stats.lost_revenue.upload = stats.lost_revenue.upload.plus(contract.upload_revenue);
			stats.lost_revenue.download = stats.lost_revenue.download.plus(contract.download_revenue);
			stats.lost_revenue.storage = stats.lost_revenue.storage.plus(contract.storage_revenue);
			stats.lost_revenue.contract_fees = stats.lost_revenue.contract_fees.plus(contract.contract_cost);
			stats.lost_revenue.transaction_fees = stats.lost_revenue.transaction_fees.plus(contract.transaction_fees);
			stats.lost_collateral = stats.lost_collateral.plus(contract.burnt_collateral);
			break;
		}
	} catch (ex) {
		log.error('addContractStats', ex);
	}
}

function mergeContract(chain, sia) {
	const c = {
		id: chain.id,
		transaction_id: chain.transaction_id,
		contract_cost: new BigNumber(sia.contractcost),
		transaction_fees: new BigNumber(sia.transactionfeesadded),
		data_size: new BigNumber(sia.datasize),
		storage_revenue: new BigNumber(sia.potentialstoragerevenue),
		download_revenue: new BigNumber(sia.potentialdownloadrevenue),
		upload_revenue: new BigNumber(sia.potentialuploadrevenue),
		sector_count: sia.sectorrootscount,
		revision_number: sia.revisionnumber,
		sia_status: sia.obligationstatus,
		status: chain.status,
		proof_confirmed: chain.proof_confirmed,
		valid_proof_outputs: chain.valid_proof_outputs,
		missed_proof_outputs: chain.missed_proof_outputs,
		negotiation_height: chain.negotiation_height,
		expiration_height: chain.expiration_height,
		proof_deadline: chain.proof_deadline,
		negotiation_timestamp: new Date(chain.negotiation_timestamp),
		expiration_timestamp: new Date(chain.expiration_timestamp),
		proof_deadline_timestamp: new Date(chain.proof_deadline_timestamp),
		proof_timestamp: new Date(chain.proof_timestamp),
		valid_payout: new BigNumber(chain.valid_proof_outputs[1].value),
		missed_payout: new BigNumber(chain.missed_proof_outputs[1].value),
		burnt_collateral: new BigNumber(0),
		returned_collateral: new BigNumber(0),
		risked_collateral: new BigNumber(0),
		locked_collateral: new BigNumber(0),
		earned_revenue: new BigNumber(0),
		lost_revenue: new BigNumber(0),
		potential_revenue: new BigNumber(0),
		unused: sia.datasize === 0,
		tags: []
	};

	switch (c.status.toLowerCase()) {
	case 'obligationsucceeded':
		c.returned_collateral = new BigNumber(sia.lockedcollateral);
		c.earned_revenue = c.valid_payout.minus(c.returned_collateral)
			.minus(c.transaction_fees);
		c.returned_collateral = c.locked_collateral;
		c.revenue = c.earned_revenue;
		break;
	case 'obligationfailed':
		c.lost_revenue = c.valid_payout.minus(sia.lockedcollateral)
			.minus(c.transaction_fees);
		c.returned_collateral = new BigNumber(c.missed_proof_outputs[1].value);
		c.burnt_collateral = new BigNumber(chain.missed_proof_outputs[2].value);
		c.revenue = c.lost_revenue;
		break;
	default:
		c.risked_collateral = new BigNumber(sia.riskedcollateral);
		c.locked_collateral = new BigNumber(sia.lockedcollateral);
		c.potential_revenue = c.storage_revenue.plus(c.download_revenue).plus(c.upload_revenue)
			.plus(c.contract_cost).minus(c.transaction_fees);
		c.revenue = c.potential_revenue;
	}

	return c;
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
		const currentBlock = await apiClient.getLastBlock(),
			alerts = [],
			invalidStatusMap = {},
			contractMap = {};

		currentBlock.timestamp = new Date(currentBlock.timestamp * 1000);

		const siaContracts = (await apiClient.getHostContracts()).contracts.map(c => {
			contractMap[c.obligationid] = c;

			return c.obligationid;
		}, []);

		const confirmed = (await getContracts(siaContracts)).map(contract => {
			const c = mergeContract(contract, contractMap[contract.id]);

			addContractStats(stats, c);

			if (c.unused) {
				c.tags.push({
					text: 'Unused'
				});
			}

			if (c.proof_deadline < currentBlock.height && !c.unused && !c.proof_confirmed) {
				c.tags.push({
					severity: 'severe',
					text: 'Proof Not Submitted'
				});
			}

			if (c.status !== c.sia_status) {
				const key = `${c.status}-${c.sia_status}`;

				if (!invalidStatusMap[key])
					invalidStatusMap[key] = 0;

				invalidStatusMap[key] += 1;

				c.tags.push({
					severity: 'warning',
					text: 'Status Mismatch'
				});
			}

			return c;
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
		Store.dispatch('hostContracts/setContracts', confirmed);
	} catch (ex) {
		log.error('parseHostContracts', ex.message);
	} finally {
		Store.dispatch('hostContracts/setStats', stats);
	}
}