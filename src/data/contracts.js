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
		return 'Ongoing';
	}

	return status;
}

export async function parseHostContracts() {
	const lastHeight = await getLastHeight(),
		contracts = await loadHostContracts(),
		map = {},
		obligationIDs = [],
		totals = {
			potential_revenue: new BigNumber(0),
			earned_revenue: new BigNumber(0),
			lost_revenue: new BigNumber(0),
			risked_collateral: new BigNumber(0),
			locked_collateral: new BigNumber(0),
			burnt_collateral: new BigNumber(0),
			ongoing_contracts: 0,
			successful_contracts: 0,
			failed_contracts: 0
		},
		startDate = new Date(new Date().setDate(-30)),
		alerts = [],
		invalidStatusMap = {};
	let minDate, maxDate, recentRevenue = new BigNumber(0);

	if (contracts.length === 0)
		return;

	contracts.forEach(c => {
		map[c.obligationid] = c;

		obligationIDs.push(c.obligationid);
	});

	const resp = await getConfirmedContracts(obligationIDs);

	if (resp.body.type !== 'success')
		throw new Error(resp.body.message);

	const filtered = resp.body.contracts.reduce((filtered, c) => {
		const match = map[c.obligation_id];

		if (!match)
			return filtered;

		const contract = {
			...c,
			proof_height: new BigNumber(c.proof_height),
			expiration_timestamp: new Date(c.expiration_timestamp),
			negotiation_timestamp: new Date(c.negotiation_timestamp),
			proof_deadline_timestamp: new Date(c.proof_deadline_timestamp),
			proof_confirm_timestamp: new Date(c.proof_confirm_timestamp),
			sia_status: match.obligationstatus,
			contract_cost: new BigNumber(match.contractcost),
			transaction_fees_added: new BigNumber(match.transactionfeesadded),
			data_size: new BigNumber(match.datasize),
			expiration_height: new BigNumber(match.expirationheight),
			negotiation_height: new BigNumber(match.negotiationheight),
			proof_deadline: new BigNumber(match.proofdeadline),
			download_revenue: new BigNumber(match.potentialdownloadrevenue),
			upload_revenue: new BigNumber(match.potentialuploadrevenue),
			storage_revenue: new BigNumber(match.potentialstoragerevenue),
			locked_collateral: new BigNumber(match.lockedcollateral),
			risked_collateral: new BigNumber(match.riskedcollateral),
			burnt_collateral: new BigNumber(c.missed_proof_outputs[2].value),
			tags: []
		};

		contract.unused = contract.data_size.eq(0) && contract.storage_revenue.eq(0);

		if (contract.unused) {
			contract.tags.push({
				severity: 'normal',
				text: 'Unused'
			});
		}

		if (contract.status !== contract.sia_status) {
			contract.tags.push({
				severity: 'warning',
				text: 'Status Mismatch'
			});
		}

		if (contract.proof_deadline.lt(lastHeight) && !contract.proof_confirmed && !contract.unused) {
			contract.tags.push({
				severity: 'severe',
				text: 'Proof Not Submitted'
			});
		}

		contract.total_revenue = contract.download_revenue
			.plus(contract.upload_revenue)
			.plus(contract.storage_revenue);

		switch (contract.status) {
		case 'obligationSucceeded':
			if (!contract.unused)
				totals.successful_contracts++;

			totals.earned_revenue = totals.earned_revenue.plus(contract.download_revenue)
				.plus(contract.storage_revenue)
				.plus(contract.upload_revenue);

			if (!minDate || (contract.expiration_timestamp.getTime() !== -62135596800000 && contract.expiration_timestamp < minDate))
				minDate = contract.expiration_timestamp;

			if (!maxDate || (contract.expiration_timestamp.getTime() !== -62135596800000 && contract.expiration_timestamp > maxDate))
				maxDate = contract.expiration_timestamp;

			if (contract.expiration_timestamp >= startDate) {
				recentRevenue = recentRevenue.plus(contract.download_revenue)
					.plus(contract.storage_revenue)
					.plus(contract.upload_revenue);
			}

			break;
		case 'obligationFailed':
			if (!contract.unused)
				totals.failed_contracts++;

			totals.burnt_collateral = totals.burnt_collateral.plus(contract.missed_proof_outputs[2].value);
			totals.lost_revenue = totals.lost_revenue.plus(contract.download_revenue)
				.plus(contract.storage_revenue)
				.plus(contract.upload_revenue);

			break;
		default:
			if (!contract.unused)
				totals.ongoing_contracts++;

			totals.risked_collateral = totals.risked_collateral.plus(contract.risked_collateral);
			totals.locked_collateral = totals.locked_collateral.plus(contract.locked_collateral);
			totals.potential_revenue = totals.potential_revenue.plus(contract.download_revenue)
				.plus(contract.storage_revenue)
				.plus(contract.upload_revenue);
			break;
		}

		if (contract.status !== contract.sia_status) {
			const key = `${contract.status}-${contract.sia_status}`;

			if (!invalidStatusMap[key])
				invalidStatusMap[key] = 0;

			invalidStatusMap[key] += 1;
		}

		filtered.push(contract);

		return filtered;
	}, []);

	if (minDate && maxDate) {
		let revenueDays = Math.floor((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));

		if (revenueDays <= 0)
			revenueDays = 1;

		Store.dispatch('hostContracts/setAverageRevenue', totals.earned_revenue.div(revenueDays));
	}

	if (totals.failed_contracts > 0) {
		let prefix;

		if (totals.failed_contracts === 1)
			prefix = `${totals.failed_contracts} contract has`;
		else
			prefix = `${totals.failed_contracts} contracts have`;

		alerts.push({
			severity: 'danger',
			category: 'contracts',
			message: `${prefix} failed resulting in ${formatPriceString(totals.lost_revenue.plus(totals.burnt_collateral))} of lost revenue and burnt collateral. Check the contracts page and your logs for more details`,
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
	Store.dispatch('hostContracts/setPotentialRevenue', totals.potential_revenue);
	Store.dispatch('hostContracts/setEarnedRevenue', totals.earned_revenue);
	Store.dispatch('hostContracts/setLostRevenue', totals.lost_revenue);
	Store.dispatch('hostContracts/setRecentRevenue', recentRevenue);
	Store.dispatch('hostContracts/setRiskedCollateral', totals.risked_collateral);
	Store.dispatch('hostContracts/setLockedCollateral', totals.locked_collateral);
	Store.dispatch('hostContracts/setBurntCollateral', totals.burnt_collateral);
	Store.dispatch('hostContracts/setOngoingContracts', totals.ongoing_contracts);
	Store.dispatch('hostContracts/setSuccessfulContracts', totals.successful_contracts);
	Store.dispatch('hostContracts/setFailedContracts', totals.failed_contracts);
}

async function loadHostContracts() {
	const resp = await apiClient.getHostContracts();

	if (resp.statusCode !== 200)
		throw new Error(resp.body.error);

	return resp.body.contracts || [];
}