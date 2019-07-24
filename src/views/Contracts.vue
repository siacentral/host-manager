<template>
	<div class="page page-contracts">
		<div class="controls">
			<div class="control control-inline">
				<select v-model="filterMode">
					<option value="obligationUnresolved">Ongoing</option>
					<option value="obligationSucceeded">Successful</option>
					<option value="obligationFailed">Failed</option>
				</select>
			</div>
			<div class="control control-inline">
				<input type="checkbox" v-model="splitRevenue" id="chk-split-revenue" />
				<label for="chk-split-revenue">Split Revenue</label>
			</div>
			<div class="control control-inline">
				<input type="checkbox" v-model="showUnused" id="chk-show-unused" />
				<label for="chk-show-unused">Show Unused</label>
			</div>
		</div>
		<div :class="{ 'display-grid': true, 'grid-4': !splitRevenue }">
			<div class="grid-item">
				<div class="item-title">Contract Count</div>
				<div class="item-value">{{ filtered.length }}</div>
			</div>
			<div class="grid-item">
				<div class="item-title">Success Rate</div>
				<div class="item-value">
					{{ successRate }}
				</div>
			</div>
			<div class="grid-item" v-if="!splitRevenue && filterMode === 'obligationFailed'">
				<div class="item-title">Lost Revenue</div>
				<div class="item-value">{{ formatPriceString(lostRevenue, 4) }}</div>
			</div>
			<div class="grid-item" v-else-if="!splitRevenue && filterMode === 'obligationSucceeded'">
				<div class="item-title">Earned Revenue</div>
				<div class="item-value">{{ formatPriceString(earnedRevenue, 4) }}</div>
			</div>
			<div class="grid-item" v-else-if="!splitRevenue">
				<div class="item-title">Potential Revenue</div>
				<div class="item-value">{{ formatPriceString(potentialRevenue, 4) }}</div>
			</div>
			<div class="grid-item">
				<div class="item-title">Average Daily Revenue</div>
				<div class="item-value">
					{{ formatPriceString(averageRevenue, 4)  }}
				</div>
			</div>
			<div class="grid-item" v-if="splitRevenue">
				<div class="item-title">Storage Revenue</div>
				<div class="item-value">{{ formatPriceString(storageRevenue, 4) }}</div>
			</div>
			<div class="grid-item" v-if="splitRevenue">
				<div class="item-title">Download Revenue</div>
				<div class="item-value">{{ formatPriceString(downloadRevenue, 4) }}</div>
			</div>
			<div class="grid-item" v-if="splitRevenue">
				<div class="item-title">Upload Revenue</div>
				<div class="item-value">{{ formatPriceString(uploadRevenue, 4) }}</div>
			</div>
		</div>
		<div class="contracts">
			<empty-state v-if="filtered.length === 0" text="You have no contracts matching that filter" icon="file-contract" />
			<div v-else class="grid-wrapper">
				<contract-grid :contracts="filtered" :filterMode="filterMode" :splitRevenue="splitRevenue" />
			</div>
		</div>
	</div>
</template>

<script>
import log from 'electron-log';

import { mapState } from 'vuex';
import { BigNumber } from 'bignumber.js';

import ContractGrid from '@/components/contracts/ContractGrid';
import EmptyState from '@/components/EmptyState';

import { formatPriceString, formatByteString } from '@/utils/format';
import { refreshHostContracts } from '@/data/contracts';

export default {
	components: {
		ContractGrid,
		EmptyState
	},
	async beforeMount() {
		try {
			await refreshHostContracts();
		} catch (ex) {
			log.error(ex);
		}
	},
	data() {
		return {
			filterMode: 'obligationUnresolved',
			splitRevenue: false,
			showUnused: false
		};
	},
	computed: {
		...mapState('hostContracts', ['contracts', 'successfulContracts',
			'failedContracts', 'potentialRevenue', 'earnedRevenue', 'lostRevenue', 'averageRevenue']),
		filtered() {
			const contracts = this.contracts.filter(c => c.status === this.filterMode && (this.showUnused || !c.unused));

			contracts.sort((a, b) => {
				if (this.filterMode === 'obligationUnresolved') {
					if (a.expiration_height > b.expiration_height)
						return 1;

					if (a.expiration_height < b.expiration_height)
						return -1;
				} else {
					if (a.expiration_height < b.expiration_height)
						return 1;

					if (a.expiration_height > b.expiration_height)
						return -1;
				}

				return 0;
			});

			return contracts;
		},
		successRate() {
			const num = this.successfulContracts;
			let denom = this.successfulContracts + this.failedContracts;

			if (denom <= 0)
				denom = 1;

			return `${Math.ceil((num / denom) * 100)}%`;
		},
		storageRevenue() {
			return this.filtered.reduce((val, c) => {
				return val.plus(c.storage_revenue);
			}, new BigNumber(0));
		},
		downloadRevenue() {
			return this.filtered.reduce((val, c) => {
				return val.plus(c.download_revenue);
			}, new BigNumber(0));
		},
		uploadRevenue() {
			return this.filtered.reduce((val, c) => {
				return val.plus(c.upload_revenue);
			}, new BigNumber(0));
		}
	},
	methods: {
		formatByteString,
		formatPriceString
	}
};
</script>

<style lang="stylus" scoped>
.controls {
	padding: 15px;
	text-align: right;

	.control {
		margin-right: 15px;
		margin-bottom: 0;

		&:last-of-type {
			margin-right: 0;
		}
	}
}
.page-contracts {
	display: grid;
	grid-template-rows: auto auto minmax(0, 1fr);
	grid-template-columns: 100%;
	grid-gap: 0;
	overflow: hidden;
}

.contracts {
	width: 100%;
	height: 100%;

	.grid-wrapper {
		width: 100%;
		height: 100%;
		overflow: auto;
	}
}

</style>
