import { BigNumber } from 'bignumber.js';
import Decimal from 'decimal.js-light';

import { apiClient } from './index';
import Store from '@/store';

let refreshing = false;

export async function refreshHostStorage() {
	if (refreshing)
		return;

	try {
		refreshing = true;

		await loadHostStorage();
	} finally {
		refreshing = false;
	}
}

async function loadHostStorage() {
	const resp = await apiClient.getHostStorage();

	let usedStorage = new BigNumber(0),
		totalStorage = new BigNumber(0),
		successfulReads = 0,
		successfulWrites = 0,
		failedReads = 0,
		failedWrites = 0,
		readPct = 0, writePct = 0;

	if (resp.statusCode !== 200)
		throw new Error(resp.body.message);

	const folders = (resp.body.folders || []).map(f => {
		let progress = 0;

		// this appears to only work on exceptionally slow add or resizes. Remove does not use this for whatever reason
		if (f.ProgressDenominator > 0)
			progress = new Decimal(f.ProgressNumerator).div(f.ProgressDenominator).toNumber();

		f = {
			path: f.path,
			index: f.index,
			total_capacity: new BigNumber(f.capacity),
			used_capacity: new BigNumber(f.capacity).minus(f.capacityremaining),
			free_capacity: new BigNumber(f.capacityremaining),
			successful_reads: f.successfulreads,
			successful_writes: f.successfulwrites,
			failed_reads: f.failedreads,
			failed_writes: f.failedwrites,
			progress
		};

		usedStorage = usedStorage.plus(f.used_capacity);
		totalStorage = totalStorage.plus(f.total_capacity);
		successfulReads += f.successful_reads;
		successfulWrites += f.successful_writes;
		failedReads += f.failed_reads;
		failedWrites += f.failed_writes;

		return f;
	});

	if (successfulReads + failedReads > 0)
		readPct = failedReads / (successfulReads + failedReads);

	if (successfulWrites + failedWrites > 0)
		writePct = failedWrites / (successfulWrites + failedWrites);

	Store.dispatch('hostStorage/setFolders', folders);
	Store.dispatch('hostStorage/setUsedStorage', usedStorage);
	Store.dispatch('hostStorage/setTotalStorage', totalStorage);
	Store.dispatch('hostStorage/setReadPercent', readPct);
	Store.dispatch('hostStorage/setWritePercent', writePct);
}