<template>
	<div class="page page-dashboard">
		<div class="wallet-controls">
			<button class="btn btn-inline" @click="modal = 'receiveTransaction'"><icon icon="wallet" /> Receive Siacoin</button>
		</div>
		<dashboard-charts />
		<div class="display-grid">
			<div class="grid-item item-warning">
				<div class="item-title">Potential Revenue</div>
				<div class="item-value">{{ formatPriceString(contractStats.potentialRevenue, 4) }}</div>
			</div>
			<div class="grid-item">
				<div class="item-title">Earned Revenue</div>
				<div class="item-value">{{ formatPriceString(contractStats.earnedRevenue, 4) }}</div>
			</div>
			<div class="grid-item item-negative">
				<div class="item-title">Lost Revenue</div>
				<div class="item-value">{{ formatPriceString(contractStats.lostRevenue, 4) }}</div>
			</div>
			<div class="grid-item">
				<div class="item-title">Locked Collateral</div>
				<div class="item-value">{{ formatPriceString(contractStats.lockedCollateral, 4) }}</div>
			</div>
			<div class="grid-item item-negative">
				<div class="item-title">Burnt Collateral</div>
				<div class="item-value">{{ formatPriceString(contractStats.burntCollateral, 4) }}</div>
			</div>
		</div>
		<receive-modal v-if="modal === 'receiveTransaction'" @close="modal = null" />
	</div>
</template>

<script>
import DashboardCharts from '@/components/charts/DashboardCharts';
import ReceiveModal from '@/components/wallet/ReceiveModal';

import { mapState } from 'vuex';
import { formatPriceString, formatByteString } from '@/utils/formatLegacy';

export default {
	components: {
		DashboardCharts,
		ReceiveModal
	},
	data() {
		return {
			modal: null
		};
	},
	computed: {
		...mapState({
			config: state => state.config,
			contractStats: state => state.hostContracts.stats,
			totalStorage: state => state.hostStorage.totalStorage,
			usedStorage: state => state.hostStorage.usedStorage
		})
	},
	methods: {
		formatPriceString,
		formatByteString
	}
};
</script>

<style lang="stylus" scoped>
.page.page-dashboard {
	display: grid;
	width: 100%;
	height: 100%;
	grid-template-rows: auto minmax(0, 1fr) auto;
	align-items: center;
	grid-gap: 15px;
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
	padding: 15px 5px;
	grid-area: auto / 1 / auto / span -1;
	text-align: right;
}
</style>
