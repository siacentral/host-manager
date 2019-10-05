import log from 'electron-log';
import { BigNumber } from 'bignumber.js';

import Store from '@/store';
import { apiClient } from './index';
import { getConfirmedContracts, getBlock } from '@/api/siacentral';
import { formatPriceString } from '@/utils/format';

async function getLastHeight() {
	const resp = await getBlock();

	if (resp.body.type !== 'success')
		return new BigNumber(0);

	return new BigNumber(resp.body.height);
}

export async function refreshHostContracts() {
	try {
		await parseHostContracts();
	} catch (ex) {
		log.error('refreshHostContracts', ex.message);
	}
}

function toFriendlyStatus(status) {
	switch (status.toLowerCase()) {
	case 'obligationsucceeded':
		return 'Successful';
	case 'obligationfailed':
		return 'Failed';
	case 'obligationrejected':
		return 'Rejected';
	case 'obligationunresolved':
		return 'Active';
	}

	return status;
}

function mergeContracts(chain, sia) {
	chain.proof_height = new BigNumber(chain.proof_height);
	chain.expiration_timestamp = new Date(chain.expiration_timestamp);
	chain.negotiation_timestamp = new Date(chain.negotiation_timestamp);
	chain.proof_deadline_timestamp = new Date(chain.proof_deadline_timestamp);
	chain.proof_confirm_timestamp = new Date(chain.proof_confirm_timestamp);
	chain.sia_status = sia.obligationstatus;
	chain.contract_cost = new BigNumber(sia.contractcost);
	chain.transaction_fees = new BigNumber(sia.transactionfeesadded);
	chain.data_size = new BigNumber(sia.datasize);
	chain.expiration_height = new BigNumber(sia.expirationheight);
	chain.negotiation_height = new BigNumber(sia.negotiationheight);
	chain.proof_deadline = new BigNumber(sia.proofdeadline);
	chain.download_revenue = new BigNumber(sia.potentialdownloadrevenue);
	chain.upload_revenue = new BigNumber(sia.potentialuploadrevenue);
	chain.storage_revenue = new BigNumber(sia.potentialstoragerevenue);
	chain.total_revenue = chain.storage_revenue.plus(chain.download_revenue).plus(chain.upload_revenue);
	chain.locked_collateral = new BigNumber(sia.lockedcollateral);
	chain.risked_collateral = new BigNumber(sia.riskedcollateral);
	chain.burnt_collateral = new BigNumber(chain.missed_proof_outputs[2].value);
	chain.tags = [];
	chain.unused = chain.data_size.eq(0) && chain.storage_revenue.eq(0);

	return chain;
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
		const lastHeight = await getLastHeight(),
			contracts = await loadHostContracts(),
			map = {},
			obligationIDs = [],
			alerts = [],
			invalidStatusMap = {};

		if (contracts.length === 0)
			return;

		contracts.forEach(c => {
			map[c.obligationid] = c;

			obligationIDs.push(c.obligationid);
		});

		const resp = await getConfirmedContracts(obligationIDs),
			filtered = [];

		if (resp.body.type !== 'success')
			throw new Error(resp.body.message);

		const currentDate = new Date(),
			days30Ago = new Date(),
			days60Ago = new Date(),
			days30Future = new Date(),
			days60Future = new Date();

		days30Ago.setDate(currentDate.getDate() - 30);
		days60Ago.setDate(currentDate.getDate() - 60);
		days30Future.setDate(currentDate.getDate() + 30);
		days60Future.setDate(currentDate.getDate() + 60);

		for (let i = 0; i < resp.body.contracts.length; i++) {
			let chainContract = resp.body.contracts[i],
				siaContract = map[chainContract.obligation_id];

			if (!siaContract)
				continue;

			chainContract = mergeContracts(chainContract, siaContract);

			if (chainContract.unused) {
				chainContract.tags.push({
					severity: 'normal',
					text: 'Unused'
				});
			}

			if (chainContract.status !== chainContract.sia_status && chainContract.proof_deadline.lt(lastHeight)) {
				const key = `${chainContract.status}-${chainContract.sia_status}`;

				if (!invalidStatusMap[key])
					invalidStatusMap[key] = 0;

				invalidStatusMap[key] += 1;

				chainContract.tags.push({
					severity: 'warning',
					text: 'Status Mismatch'
				});
			}

			if (chainContract.proof_deadline.lt(lastHeight) && !chainContract.proof_confirmed && !chainContract.unused) {
				chainContract.tags.push({
					severity: 'severe',
					text: 'Proof Not Submitted'
				});
			}

			switch (chainContract.status) {
			case 'obligationUnresolved':
				if (chainContract.unused)
					stats.contracts.unused++;
				else
					stats.contracts.active++;

				if (chainContract.expiration_timestamp <= days30Future) {
					stats.potential_revenue.days_30 = stats.potential_revenue.days_30.plus(chainContract.total_revenue);
					stats.contracts.next_30_days++;
				}

				if (chainContract.expiration_timestamp <= days60Future) {
					stats.potential_revenue.days_60 = stats.potential_revenue.days_60.plus(chainContract.total_revenue);
					stats.contracts.next_60_days++;
				}

				stats.potential_revenue.total = stats.potential_revenue.total.plus(chainContract.total_revenue);
				stats.potential_revenue.upload = stats.potential_revenue.upload.plus(chainContract.upload_revenue);
				stats.potential_revenue.download = stats.potential_revenue.download.plus(chainContract.download_revenue);
				stats.potential_revenue.storage = stats.potential_revenue.storage.plus(chainContract.storage_revenue);
				stats.potential_revenue.contract_fees = stats.potential_revenue.contract_fees.plus(chainContract.contract_cost);
				stats.potential_revenue.transaction_fees = stats.potential_revenue.transaction_fees.plus(chainContract.transaction_fees);
				stats.locked_collateral = stats.locked_collateral.plus(chainContract.locked_collateral);
				stats.risked_collateral = stats.risked_collateral.plus(chainContract.risked_collateral);

				break;
			case 'obligationSucceeded':
				if (!chainContract.unused)
					stats.contracts.successful++;

				if (chainContract.expiration_timestamp > days30Ago) {
					stats.earned_revenue.days_30 = stats.earned_revenue.days_30.plus(chainContract.total_revenue);
					stats.contracts.past_30_days++;
				}

				if (chainContract.expiration_timestamp > days60Ago) {
					stats.earned_revenue.days_60 = stats.earned_revenue.days_60.plus(chainContract.total_revenue);
					stats.contracts.past_60_days++;
				}

				stats.earned_revenue.total = stats.earned_revenue.total.plus(chainContract.total_revenue);
				stats.earned_revenue.upload = stats.earned_revenue.upload.plus(chainContract.upload_revenue);
				stats.earned_revenue.download = stats.earned_revenue.download.plus(chainContract.download_revenue);
				stats.earned_revenue.storage = stats.earned_revenue.storage.plus(chainContract.storage_revenue);
				stats.earned_revenue.contract_fees = stats.earned_revenue.contract_fees.plus(chainContract.contract_cost);
				stats.earned_revenue.transaction_fees = stats.earned_revenue.transaction_fees.plus(chainContract.transaction_fees);
				break;
			case 'obligationFailed':
				stats.contracts.failed++;

				if (chainContract.expiration_timestamp > days30Ago) {
					stats.lost_revenue.days_30 = stats.lost_revenue.days_30.plus(chainContract.total_revenue);
					stats.contracts.past_30_days++;
				}

				if (chainContract.expiration_timestamp > days60Ago) {
					stats.lost_revenue.days_60 = stats.lost_revenue.days_60.plus(chainContract.total_revenue);
					stats.contracts.past_60_days++;
				}

				stats.lost_revenue.total = stats.lost_revenue.total.plus(chainContract.total_revenue);
				stats.lost_revenue.upload = stats.lost_revenue.upload.plus(chainContract.upload_revenue);
				stats.lost_revenue.download = stats.lost_revenue.download.plus(chainContract.download_revenue);
				stats.lost_revenue.storage = stats.lost_revenue.storage.plus(chainContract.storage_revenue);
				stats.lost_revenue.contract_fees = stats.lost_revenue.contract_fees.plus(chainContract.contract_cost);
				stats.lost_revenue.transaction_fees = stats.lost_revenue.transaction_fees.plus(chainContract.transaction_fees);
				stats.lost_collateral = stats.lost_collateral.plus(chainContract.missed_proof_outputs[2].value);
				break;
			}

			filtered.push(chainContract);
		}

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
				actualStatus = toFriendlyStatus(statuses[0].trim()),
				siaStatus = toFriendlyStatus(statuses[1].trim());
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