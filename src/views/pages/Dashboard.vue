<template>
	<div class="page page-dashboard">
		<div class="storage-usage">
			<icon icon="hdd" />
			<div class="usage-wrapper">
				<div class="usage-bar"><div class="bar" :style="storagePct" /></div>
				<div class="usage-label">{{ formatByteString(usedStorage, 2) }} / {{ formatByteString(totalStorage, 2) }}</div>
			</div>
		</div>
		<revenue-chart class="chart" :snapshots="snapshots" />
		<contract-chart class="chart" :snapshots="snapshots" />
		<div class="display-grid">
			<div class="grid-item">
				<div class="item-title">Active Contracts</div>
				<div class="item-value">{{ formatNumber(contractStats.active, 0) }}</div>
			</div>
			<div class="grid-item">
				<div class="item-title">Successful Contracts</div>
				<div class="item-value">{{ formatNumber(contractStats.successful, 0) }}</div>
			</div>
			<div class="grid-item">
				<div class="item-title">Failed Contracts</div>
				<div class="item-value">{{ formatNumber(contractStats.failed, 0) }}</div>
			</div>
			<div class="grid-item">
				<div class="item-title">Potential Revenue</div>
				<div class="item-value">{{ formatPriceString(contractStats.potentialRevenue, 4) }}</div>
			</div>
			<div class="grid-item">
				<div class="item-title">Earned Revenue</div>
				<div class="item-value">{{ formatPriceString(contractStats.earnedRevenue, 4) }}</div>
			</div>
			<div class="grid-item">
				<div class="item-title">Lost Revenue</div>
				<div class="item-value">{{ formatPriceString(contractStats.lostRevenue, 4) }}</div>
			</div>
			<div class="grid-item">
				<div class="item-title">Locked Collateral</div>
				<div class="item-value">{{ formatPriceString(contractStats.lockedCollateral, 4) }}</div>
			</div>
			<div class="grid-item">
				<div class="item-title">Risked Collateral</div>
				<div class="item-value">{{ formatPriceString(contractStats.riskedCollateral, 4) }}</div>
			</div>
			<div class="grid-item">
				<div class="item-title">Burnt Collateral</div>
				<div class="item-value">{{ formatPriceString(contractStats.burntCollateral, 4) }}</div>
			</div>
		</div>
	</div>
</template>

<script>
import ContractChart from '@/components/charts/ContractChart';
import RevenueChart from '@/components/charts/RevenueChart';

import { mapState, mapGetters } from 'vuex';
import { formatPriceString, formatByteString, formatNumber } from '@/utils/formatLegacy';

export default {
	components: {
		ContractChart,
		RevenueChart
	},
	computed: {
		...mapGetters('hostContracts', ['snapshots']),
		...mapState({
			config: state => state.config,
			contractStats: state => state.hostContracts.stats,
			totalStorage: state => state.hostStorage.totalStorage,
			usedStorage: state => state.hostStorage.usedStorage
		}),
		storagePct() {
			return {
				width: `${(this.usedStorage / this.totalStorage) * 100}%`
			};
		}
	},
	methods: {
		formatPriceString,
		formatByteString,
		formatNumber
	}
};
</script>

<style lang="stylus" scoped>
.page.page-dashboard {
	display: grid;
	width: 100%;
	height: 100%;
	grid-template-rows: auto repeat(2, 1fr) auto;
	grid-gap: 15px;
	padding: 15px;
	overflow: hidden;
}

.graph {
	height: 80%;
}

.display-grid {
	padding: 15px;
	grid-area: auto / 1 / auto / span -1;
}

.wallet-controls {
	grid-area: auto / 1 / auto / span -1;
	text-align: right;

	button:last-child {
		margin: 0;
	}
}

.storage-usage {
    display: grid;
    grid-gap: 15px;
    padding: 15px;
    background: bg-dark-accent;
    border-radius: 8px;
    grid-template-columns: 64px minmax(0, 1fr);
    align-items: center;

	svg {
		width: 32px;
		height: auto;
		margin: 0 auto;
	}

	.usage-bar {
		width: 100%;
		height: 8px;
		background: #5d5d5d;
		border-radius: 16px;
		margin-bottom: 3px;
		overflow: hidden;

		.bar {
			height: 8px;
			background: primary;
		}
	}

	.usage-label {
		font-size: 0.8rem;
		color: rgba(255, 255, 255, 0.4);
		text-align: center;
	}
}
</style>
