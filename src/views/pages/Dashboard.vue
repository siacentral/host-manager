<template>
	<div class="page page-dashboard">
		<div class="storage-usage">
			<icon icon="hdd" />
			<div class="usage-wrapper">
				<div class="usage-title">Storage Usage</div>
				<div class="usage-bar"><div class="bar" :style="storagePct" /></div>
				<div class="usage-label">{{ formatByteString(usedStorage, 2) }} / {{ formatByteString(totalStorage, 2) }}</div>
			</div>
		</div>
		<div class="registry-usage" v-if="totalRegKeys !== 0">
			<icon icon="database" />
			<div class="usage-wrapper">
				<div class="usage-title">Registry Usage</div>
				<div class="usage-bar"><div class="bar" :style="registryPct" /></div>
				<div class="usage-label">{{ formatNumber(totalRegKeys - remainingRegKeys, 0) }} / {{ formatNumber(totalRegKeys, 0) }}</div>
			</div>
		</div>
		<div v-else />
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
				<div class="item-value" v-html="formatCurrencyDisplay(contractStats.potentialRevenue)" />
			</div>
			<div class="grid-item">
				<div class="item-title">Earned Revenue</div>
				<div class="item-value" v-html="formatCurrencyDisplay(contractStats.earnedRevenue)" />
			</div>
			<div class="grid-item">
				<div class="item-title">Lost Revenue</div>
				<div class="item-value" v-html="formatCurrencyDisplay(contractStats.lostRevenue)" />
			</div>
			<div class="grid-item">
				<div class="item-title">Locked Collateral</div>
				<div class="item-value" v-html="formatCurrencyDisplay(contractStats.lockedCollateral)" />
			</div>
			<div class="grid-item">
				<div class="item-title">Risked Collateral</div>
				<div class="item-value" v-html="formatCurrencyDisplay(contractStats.riskedCollateral)" />
			</div>
			<div class="grid-item">
				<div class="item-title">Burnt Collateral</div>
				<div class="item-value" v-html="formatCurrencyDisplay(contractStats.burntCollateral)" />
			</div>
		</div>
	</div>
</template>

<script>
import ContractChart from '@/components/charts/ContractChart';
import RevenueChart from '@/components/charts/RevenueChart';

import { mapState, mapGetters } from 'vuex';
import { formatByteString, formatNumber } from '@/utils/formatLegacy';
import { formatPriceString } from '@/utils/format';

export default {
	components: {
		ContractChart,
		RevenueChart
	},
	computed: {
		...mapGetters('hostContracts', ['snapshots']),
		...mapState({
			config: state => state.config,
			currency: state => state.config.currency,
			coinPrice: state => state.coinPrice,
			remainingRegKeys: state => state.hostConfig.pricetable.registryentriesleft,
			totalRegKeys: state => state.hostConfig.pricetable.registryentriestotal,
			contractStats: state => state.hostContracts.stats,
			totalStorage: state => state.hostStorage.totalStorage,
			usedStorage: state => state.hostStorage.usedStorage
		}),
		storagePct() {
			return {
				width: `${(this.usedStorage / this.totalStorage) * 100}%`
			};
		},
		registryPct() {
			const used = this.totalRegKeys - this.remainingRegKeys;

			if (typeof this.totalRegKeys !== 'number' || this.totalRegKeys === 0)
				return {};

			return {
				width: `${Math.ceil((used / this.totalRegKeys) * 100)}%`
			};
		}
	},
	methods: {
		formatByteString,
		formatNumber,
		formatCurrencyDisplay(value) {
			const sc = formatPriceString(value, 2, 'sc', 1),
				disp = formatPriceString(value, 2, this.currency, this.coinPrice[this.currency]);

			return `<div>${sc.value} <span class="currency-display">${sc.label}</span></div><div>${disp.value} <span class="currency-display">${disp.label}</span></div>`;
		}
	}
};
</script>

<style lang="stylus" scoped>
.page.page-dashboard {
	display: grid;
	width: 100%;
	height: 100%;
	grid-template-rows: repeat(2, auto) repeat(2, 1fr) auto;
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

	.item-value {
		font-size: 1.2rem;
	}
}

.wallet-controls {
	grid-area: auto / 1 / auto / span -1;
	text-align: right;

	button:last-child {
		margin: 0;
	}
}

.storage-usage, .registry-usage {
    display: grid;
    grid-gap: 15px;
    padding: 15px;
    background: bg-dark-accent;
    border-radius: 8px;
    grid-template-columns: 48px minmax(0, 1fr);
    align-items: center;

	svg {
		width: 24px;
		height: auto;
		margin: 0 auto;
		color: rgba(255, 255, 255, 0.84);
	}

	&.registry-usage svg {
		height: 24px;
		width: auto;
	}

	.usage-title {
		color: rgba(255, 255, 255, 0.54);
		font-size: 0.8rem;
		margin-bottom: 5px;
		text-align: center;
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
