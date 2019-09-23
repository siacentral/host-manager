<template>
	<div class="page page-contracts">
		<div class="controls">
			<div class="control control-inline">
				<select v-model="filterMode">
					<option value="obligationUnresolved">Active</option>
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
		<div class="display-grid grid-4">
			<div class="grid-item">
				<div class="item-title">Contract Count</div>
				<div class="item-value">{{ filtered.length }}</div>
			</div>
			<template v-if="filterMode === 'obligationFailed'">
				<div class="grid-item">
					<div class="item-title">Lost Revenue</div>
					<div class="item-value">{{ formatPriceString(stats.lost_revenue.total, 4) }}</div>
				</div>
				<div class="grid-item">
					<div class="item-title">Last 30 Days</div>
					<div class="item-value">
						{{ formatPriceString(stats.lost_revenue.days_30, 4)  }}
					</div>
				</div>
				<div class="grid-item">
					<div class="item-title">Last 60 Days</div>
					<div class="item-value">
						{{ formatPriceString(stats.lost_revenue.days_60, 4)  }}
					</div>
				</div>
			</template>
			<template v-else-if="filterMode === 'obligationSucceeded'">
				<div class="grid-item">
					<div class="item-title">Earned Revenue</div>
					<div class="item-value">{{ formatPriceString(stats.earned_revenue.total, 4) }}</div>
				</div>
				<div class="grid-item">
					<div class="item-title">Last 30 Days</div>
					<div class="item-value">
						{{ formatPriceString(stats.earned_revenue.days_30, 4)  }}
					</div>
				</div>
				<div class="grid-item">
					<div class="item-title">Last 60 Days</div>
					<div class="item-value">
						{{ formatPriceString(stats.earned_revenue.days_60, 4)  }}
					</div>
				</div>
			</template>
			<template v-else>
				<div class="grid-item">
					<div class="item-title">Potential Revenue</div>
					<div class="item-value">{{ formatPriceString(stats.potential_revenue.total, 4) }}</div>
				</div>
				<div class="grid-item">
					<div class="item-title">Next 30 Days</div>
					<div class="item-value">
						{{ formatPriceString(stats.potential_revenue.days_30, 4)  }}
					</div>
				</div>
				<div class="grid-item">
					<div class="item-title">Next 60 Days</div>
					<div class="item-value">
						{{ formatPriceString(stats.potential_revenue.days_60, 4)  }}
					</div>
				</div>
			</template>
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
import { mapState } from 'vuex';

import ContractGrid from '@/components/contracts/ContractGrid';
import EmptyState from '@/components/EmptyState';

import { formatPriceString, formatByteString } from '@/utils/format';

export default {
	components: {
		ContractGrid,
		EmptyState
	},
	data() {
		return {
			filterMode: 'obligationUnresolved',
			splitRevenue: false,
			showUnused: false
		};
	},
	computed: {
		...mapState('hostContracts', ['contracts', 'stats']),
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
			const num = this.stats.contracts.successful;
			let denom = this.stats.contracts.successful + this.stats.contracts.failed;

			if (denom <= 0)
				denom = 1;

			return `${Math.ceil((num / denom) * 100)}%`;
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
