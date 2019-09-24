<template>
	<div class="dashboard-stats">
		<button class="close-button" @click="$emit('close')"><icon icon="times" /></button>
		<div class="stats-content">
			<div class="stats-grid contract-grid">
				<div class="stats-header contract-header">Contracts</div>
				<div class="stat-item">
					<div class="item-title">Active</div>
					<div class="item-value">{{ contractCounts.active }}</div>
				</div>
				<div class="stat-item">
					<div class="item-title">Unused</div>
					<div class="item-value">{{ contractCounts.unused  }}</div>
				</div>
				<div class="stat-item">
					<div class="item-title">Successful</div>
					<div class="item-value">{{ contractCounts.successful  }}</div>
				</div>
				<div class="stat-item">
					<div class="item-title">Failed</div>
					<div class="item-value">{{ contractCounts.failed }}</div>
				</div>
				<div class="stats-header contract-header">Expiring/Expired Contracts</div>
				<div class="stat-item">
					<div class="item-title">Past 30 Days</div>
					<div class="item-value">{{ contractCounts.past_30_days }}</div>
				</div>
				<div class="stat-item">
					<div class="item-title">Past 60 Days</div>
					<div class="item-value">{{ contractCounts.past_60_days  }}</div>
				</div>
				<div class="stat-item">
					<div class="item-title">Next 30 Days</div>
					<div class="item-value">{{ contractCounts.next_30_days  }}</div>
				</div>
				<div class="stat-item">
					<div class="item-title">Next 60 Days</div>
					<div class="item-value">{{ contractCounts.next_60_days }}</div>
				</div>
			</div>
			<div class="stats-grid">
				<div class="stats-header">Potential Revenue</div>
				<div class="stat-item">
					<div class="item-title">Total</div>
					<div class="item-value">{{ formatPriceString(stats.potential_revenue.total, 4) }}</div>
				</div>
				<div class="stat-item">
					<div class="item-title">Next 30 Days</div>
					<div class="item-value">{{ formatPriceString(stats.potential_revenue.days_30, 4)  }}</div>
				</div>
				<div class="stat-item">
					<div class="item-title">Next 60 Days</div>
					<div class="item-value">{{ formatPriceString(stats.potential_revenue.days_60, 4)  }}</div>
				</div>
				<div class="stat-item">
					<div class="item-title">Storage</div>
					<div class="item-value">{{ formatPriceString(stats.potential_revenue.storage, 4) }}</div>
				</div>
				<div class="stat-item">
					<div class="item-title">Upload</div>
					<div class="item-value">{{ formatPriceString(stats.potential_revenue.upload, 4)  }}</div>
				</div>
				<div class="stat-item">
					<div class="item-title">Download</div>
					<div class="item-value">{{ formatPriceString(stats.potential_revenue.download, 4)  }}</div>
				</div>
				<div class="stats-header">Earned Revenue</div>
				<div class="stat-item">
					<div class="item-title">Total</div>
					<div class="item-value">{{ formatPriceString(stats.earned_revenue.total, 4) }}</div>
				</div>
				<div class="stat-item">
					<div class="item-title">Last 30 Days</div>
					<div class="item-value">{{ formatPriceString(stats.earned_revenue.days_30, 4)  }}</div>
				</div>
				<div class="stat-item">
					<div class="item-title">Last 60 Days</div>
					<div class="item-value">{{ formatPriceString(stats.earned_revenue.days_60, 4)  }}</div>
				</div>
				<div class="stat-item">
					<div class="item-title">Storage</div>
					<div class="item-value">{{ formatPriceString(stats.earned_revenue.storage, 4) }}</div>
				</div>
				<div class="stat-item">
					<div class="item-title">Upload</div>
					<div class="item-value">{{ formatPriceString(stats.earned_revenue.upload, 4)  }}</div>
				</div>
				<div class="stat-item">
					<div class="item-title">Download</div>
					<div class="item-value">{{ formatPriceString(stats.earned_revenue.download, 4)  }}</div>
				</div>
				<div class="stats-header">Lost Revenue</div>
				<div class="stat-item">
					<div class="item-title">Total</div>
					<div class="item-value">{{ formatPriceString(stats.lost_revenue.total, 4) }}</div>
				</div>
				<div class="stat-item">
					<div class="item-title">Last 30 Days</div>
					<div class="item-value">{{ formatPriceString(stats.lost_revenue.days_30, 4)  }}</div>
				</div>
				<div class="stat-item">
					<div class="item-title">Last 60 Days</div>
					<div class="item-value">{{ formatPriceString(stats.lost_revenue.days_60, 4)  }}</div>
				</div>
				<div class="stat-item">
					<div class="item-title">Storage</div>
					<div class="item-value">{{ formatPriceString(stats.lost_revenue.storage, 4) }}</div>
				</div>
				<div class="stat-item">
					<div class="item-title">Upload</div>
					<div class="item-value">{{ formatPriceString(stats.lost_revenue.upload, 4)  }}</div>
				</div>
				<div class="stat-item">
					<div class="item-title">Download</div>
					<div class="item-value">{{ formatPriceString(stats.lost_revenue.download, 4)  }}</div>
				</div>
				<div class="stats-header">Collateral</div>
				<div class="stat-item">
					<div class="item-title">Locked</div>
					<div class="item-value">{{ formatPriceString(stats.locked_collateral, 4) }}</div>
				</div>
				<div class="stat-item">
					<div class="item-title">Risked</div>
					<div class="item-value">{{ formatPriceString(stats.risked_collateral, 4)  }}</div>
				</div>
				<div class="stat-item">
					<div class="item-title">Lost</div>
					<div class="item-value">{{ formatPriceString(stats.lost_collateral, 4)  }}</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { BigNumber } from 'bignumber.js';
import { mapState } from 'vuex';
import { formatPriceString, formatNumber } from '@/utils/format';

export default {
	computed: {
		...mapState('hostContracts', ['stats']),
		contractCounts() {
			return {
				active: formatNumber(new BigNumber(this.stats.contracts.active)),
				unused: formatNumber(new BigNumber(this.stats.contracts.unused)),
				successful: formatNumber(new BigNumber(this.stats.contracts.successful)),
				failed: formatNumber(new BigNumber(this.stats.contracts.failed)),
				past_30_days: formatNumber(new BigNumber(this.stats.contracts.past_30_days)),
				past_60_days: formatNumber(new BigNumber(this.stats.contracts.past_60_days)),
				next_30_days: formatNumber(new BigNumber(this.stats.contracts.next_30_days)),
				next_60_days: formatNumber(new BigNumber(this.stats.contracts.next_60_days))
			};
		}
	},
	methods: {
		formatPriceString
	}
};
</script>

<style lang="stylus" scoped>
.dashboard-stats {
	position: absolute;
	top: 0;
	left: 0;
	bottom: 0;
	right: 0;
	width: 100%;
	height: 100%;
	background: bg-dark;
	overflow: hidden;
	padding: 35px 15px 15px;

	.close-button {
		position: absolute;
		top: 15px;
		right: 15px;
		display: inline-block;
		background: none;
		outline: none;
		border: none;
		font-size: 1.2rem;
		color: rgba(255, 255, 255, 0.84);
		cursor: pointer;
	}

	.stats-content {
		width: 100%;
		height: 100%;
		overflow-y: auto;
	}

	.stats-grid {
		display: grid;
		max-width: 1000px;
		margin: auto;
		grid-template-columns: repeat(2, auto);
		grid-gap: 15px;
		overflow: auto;
		justify-content: space-between;
		align-content: center;
		align-items: center;
	}

	@media screen and (min-width: 801px) {
		.stats-grid {
			grid-template-columns: repeat(3, auto);

			&.contract-grid {
				grid-template-columns: repeat(4, auto);
			}
		}
	}

	.stat-item {
		text-align: left;
		border: none;
		white-space: nowrap;

		&.stat-contract {
			grid-column: auto / span 3;
		}

		.item-title {
			margin-bottom: 10px;
			font-size: 0.8rem;
			color: primary;
		}

		.item-value {
			font-size: 1rem;
		}
	}

	.stats-header {
		grid-column: 1 / -1;
		margin: 30px 0 5px;
		font-size: 1.1rem;
		color: rgba(255, 255, 255, 0.54);
	}
}
</style>