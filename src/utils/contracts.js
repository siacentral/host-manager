'use strict';

import { getContracts, getBlock } from '@/utils/siacentral';
import { BigNumber } from 'bignumber.js';
import { parseNumberString } from '@/utils/parse';

async function getHeight() {
	const resp = await getBlock();

	if (resp.type === 'success')
		return resp.height;

	return 0;
}

async function getBlockTimestamp(height) {
	const resp = await getBlock(height);

	if (resp.type === 'success')
		return new Date(resp.block.timestamp);

	return new Date(0);
}

function addAlert(globalAlerts, tag, msg) {
	if (!globalAlerts[tag]) {
		globalAlerts[tag] = {
			count: 0,
			value: msg
		};
	}

	globalAlerts[tag].count += 1;

	return globalAlerts;
}

function determineAlerts(contract, globalAlerts, blockHeight) {
	let alerts = [];

	if (contract.status === 'obligationUnresolved' && contract.actualStatus === 'obligationFailed') {
		alerts.push({
			key: '',
			value: 'Contract is still ongoing even though proof deadline has passed, revenue and collateral is lost.'
		});

		globalAlerts = addAlert(globalAlerts, `contract_unresolved_past_deadline`, 'Contract is still ongoing even though proof deadline has passed, revenue and collateral is lost');
	}

	if (contract.status === 'obligationSucceeded' && !contract.proof_confirmed && contract.proof_deadline.lt(blockHeight) && contract.total_revenue.gt(0)) {
		alerts.push({
			key: '',
			value: `Contract was set to ${contract.friendlyStatus.toLowerCase()} even though no proof was confirmed on the block chain`
		});
		globalAlerts = addAlert(globalAlerts, `contract_incorrect_status`, 'Contract was changed to "succeeded" but no storage proof was confirmed');
	}

	if (contract.status === 'obligationUnresolved' && contract.actualStatus === 'obligationSucceeded' && contract.proof_deadline.gt(blockHeight)) {
		alerts.push({
			value: 'Proof is confirmed but contract is still ongoing this contract should move to succeeded before the proof deadline'
		});
	} else if (contract.status === 'obligationUnresolved' && contract.actualStatus === 'obligationSucceeded' && contract.proof_deadline.lt(blockHeight)) {
		alerts.push({
			value: 'Proof was confirmed but contract is still ongoing and proof deadline has passed. Contract should have nmoved to succeeded.'
		});

		globalAlerts = addAlert(globalAlerts, `contract_incorrect_status`, 'Proof was confirmed but contract is still ongoing and proof deadline has passed. Contract should have moved to succeeded.');
	}

	if (contract.proof_deadline.lt(blockHeight) && !contract.proof_confirmed && contract.total_revenue.gt(0)) {
		alerts.push({
			key: '',
			value: `Proof was not submitted before deadline at ${contract.proof_deadline.toString(10)}. Check your logs for the reason`
		});
		globalAlerts = addAlert(globalAlerts, 'proof_not_submitted', 'Proof was not submitted before deadline');
	}

	return { globalAlerts, alerts };
}

async function checkContracts(contracts) {
	const height = await getHeight(),
		resp = await getContracts(contracts.map(c => c.obligation_id)),
		totals = {
			earned_revenue: new BigNumber(0),
			potential_revenue: new BigNumber(0),
			lost_revenue: new BigNumber(0),
			burnt_collateral: new BigNumber(0),
			risked_collateral: new BigNumber(0),
			contract_count: new BigNumber(resp.contracts.length),
			failed_count: new BigNumber(0),
			success_count: new BigNumber(0),
			ongoing_count: new BigNumber(0),
			daily_revenue: new BigNumber(0)
		};
	let globalAlerts = {}, minHeight, maxHeight;

	if (resp.type !== 'success')
		return;

	const filtered = resp.contracts.map(c => {
			const siaContract = contracts.filter(s => s.obligation_id === c.obligation_id)[0];

			if (!siaContract)
				throw new Error('contract id not requested');

			return { ...siaContract, ...c };
		}),
		groups = {};

	filtered.forEach(c => {
		let friendlyStatus, status;

		c.data_size = new BigNumber(c.data_size);
		c.proof_deadline = new BigNumber(c.proof_deadline);
		c.block_height = new BigNumber(c.block_height);
		c.proof_height = new BigNumber(c.proof_height);
		c.expiration_height = new BigNumber(c.expiration_height);
		c.friendlyStatus = c.status === 'obligationSucceeded' ? 'Succeeded' : c.status === 'obligationFailed' ? 'Failed' : 'Ongoing';
		c.alerts = [];

		if (!c.proof_confirmed && c.proof_deadline.gt(height)) {
			friendlyStatus = 'Ongoing';
			status = 'obligationUnresolved';
			totals.potential_revenue = totals.potential_revenue.plus(c.total_revenue);
			totals.risked_collateral = totals.risked_collateral.plus(c.risked_collateral);
			totals.ongoing_count = totals.ongoing_count.plus(1);
		} else if (c.proof_deadline.lt(height) && !c.proof_confirmed && c.total_revenue.gt(0)) {
			friendlyStatus = 'Failed';
			status = 'obligationFailed';
			totals.lost_revenue = totals.lost_revenue.plus(c.total_revenue);
			totals.burnt_collateral = totals.burnt_collateral.plus(c.missed_proof_outputs[2].value);
			totals.failed_count = totals.failed_count.plus(1);
		} else if (c.proof_confirmed || (c.proof_deadline.lt(height) && c.total_revenue.eq(0))) {
			friendlyStatus = 'Succeeded';
			status = 'obligationSucceeded';
			totals.earned_revenue = totals.earned_revenue.plus(c.total_revenue);
			totals.success_count = totals.success_count.plus(1);

			if (c.proof_deadline.lt(height)) {
				totals.daily_revenue = totals.daily_revenue.plus(c.total_revenue);

				if (!minHeight || minHeight.gt(c.block_height))
					minHeight = c.block_height;

				if (!maxHeight || maxHeight.lt(c.block_height))
					maxHeight = c.block_height;
			}
		}

		c.actualStatus = status;

		const contractAlerts = determineAlerts(c, globalAlerts, height);

		globalAlerts = { ...globalAlerts, ...contractAlerts.globalAlerts };
		c.alerts = contractAlerts.alerts;

		if (!groups[status]) {
			groups[status] = {
				status,
				friendlyStatus,
				contracts: [],
				alerts: [],
				total_revenue: new BigNumber(0),
				data_size: new BigNumber(0),
				locked_collateral: new BigNumber(0),
				risked_collateral: new BigNumber(0),
				burnt_collateral: new BigNumber(0),
				contract_cost: new BigNumber(0)
			};
		}

		groups[status].contracts.push(c);
		groups[status].total_revenue = groups[status].total_revenue.plus(c.total_revenue);
		groups[status].data_size = groups[status].data_size.plus(c.data_size);
		groups[status].locked_collateral = groups[status].locked_collateral.plus(c.locked_collateral);
		groups[status].risked_collateral = groups[status].risked_collateral.plus(c.risked_collateral);
		groups[status].burnt_collateral = groups[status].burnt_collateral.plus(c.missed_proof_outputs[2].value);
		groups[status].contract_cost = groups[status].contract_cost.plus(c.contract_cost);

		groups[status].contracts = groups[status].contracts.sort((a, b) => {
			if ((a.alerts && !b.alerts) || a.alerts.length > b.alerts.length)
				return -1;

			if ((!a.alerts && b.alerts) || a.alerts.length < b.alerts.length)
				return 1;

			if (a.proof_deadline.lt(b.proof_deadline))
				return -1;

			if (a.proof_deadline.gt(b.proof_deadline))
				return 1;

			return 0;
		});
	});

	const minDate = (await getBlockTimestamp(minHeight)).getTime(),
		maxDate = (await getBlockTimestamp(maxHeight)).getTime();

	totals.daily_revenue = totals.daily_revenue.div(Math.floor((maxDate / (1000 * 60 * 60 * 24)) / (minDate / (1000 * 60 * 60 * 24))));

	groups.global = globalAlerts;
	groups.totals = totals;

	return groups;
}

function parseSiaString(val) {
	if (val.indexOf('H') >= 0)
		return new BigNumber(val.replace(/[^0-9.]/g, ''));

	return parseNumberString(val, 1000, ['pS', 'nS', 'uS', 'mS', 'SC', 'KS', 'MS', 'GS', 'TS']).times(1e12);
}

function parseContractText(text) {
	if (!text || text.length === 0)
		return [];

	try {
		const contracts = JSON.parse(text);

		if (!contracts.contracts || !Array.isArray(contracts.contracts))
			return [];

		return contracts.contracts.map(c => ({
			obligation_id: c.obligationid,
			status: c.obligationstatus,
			total_revenue: new BigNumber(c.potentialstoragerevenue)
				.plus(c.potentialuploadrevenue)
				.plus(c.potentialdownloadrevenue),
			contract_cost: new BigNumber(c.contractcost),
			locked_collateral: new BigNumber(c.lockedcollateral),
			risked_collateral: new BigNumber(c.riskedcollateral)
		}));
	} catch (ex) {
		console.log(ex);
	}

	try {
		let lines = text.split(/\n|\r\n/gm),
			contracts = [];

		if (lines.length === 0)
			throw new Error('no contracts found');

		const startLine = lines.findIndex(l => l.indexOf('Obligation Id   ') === 0);

		if (startLine < 0)
			throw new Error('contract output not found');

		lines = lines.slice(startLine + 1);

		lines.forEach(l => {
			if (!l || typeof l !== 'string' || l.length === 0)
				return;

			const fields = l.split(/\s{2,}/g);

			if (fields.length !== 8)
				return;

			let status;

			switch (fields[1].toLowerCase()) {
			case 'succeeded':
				status = 'obligationSucceeded';
				break;
			case 'failed':
				status = 'obligationFailed';
				break;
			default:
				status = 'obligationUnresolved';
				break;
			}

			contracts.push({
				obligation_id: fields[0],
				status: status,
				locked_collateral: parseSiaString(fields[3]),
				risked_collateral: parseSiaString(fields[4]),
				total_revenue: parseSiaString(fields[5]),
				contract_cost: parseSiaString(fields[2])
			});
		});

		return contracts;
	} catch (ex) {
		console.log(ex);
	}

	return [];
}

export function fixContracts(text) {
	const contracts = parseContractText(text);

	if (contracts.length === 0)
		throw new Error('no contracts found. check output');

	return checkContracts(contracts);
}