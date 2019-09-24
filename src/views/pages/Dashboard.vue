<template>
	<div class="page page-dashboard">
		<div class="wallet-controls">
			<button class="btn btn-inline" @click="showExtra = true"><icon icon="coins" /> Revenue Statistics</button>
			<button class="btn btn-inline" @click="modal = 'receiveTransaction'"><icon icon="wallet" /> Receive Siacoin</button>
		</div>
		<donut-graph class="graph" :data="contractsGraph" :defaultIndex="0" icon="file-contract" />
		<donut-graph class="graph" :data="storageGraph" :defaultIndex="0" icon="hdd" />
		<div class="display-grid">
			<div class="grid-item">
				<div class="item-title">Potential Revenue</div>
				<div class="item-value">{{ formatPriceString(contractStats.potential_revenue.total, 4) }}</div>
			</div>
			<div class="grid-item">
				<div class="item-title">Earned Revenue</div>
				<div class="item-value">{{ formatPriceString(contractStats.earned_revenue.total, 4) }}</div>
			</div>
			<div class="grid-item item-negative">
				<div class="item-title">Lost Revenue</div>
				<div class="item-value">{{ formatPriceString(contractStats.lost_revenue.total, 4) }}</div>
			</div>
			<div class="grid-item">
				<div class="item-title">Risked Collateral</div>
				<div class="item-value">{{ formatPriceString(contractStats.risked_collateral, 4) }}</div>
			</div>
			<div class="grid-item">
				<div class="item-title">Locked Collateral</div>
				<div class="item-value">{{ formatPriceString(contractStats.locked_collateral, 4) }}</div>
			</div>
			<div class="grid-item item-negative">
				<div class="item-title">Burnt Collateral</div>
				<div class="item-value">{{ formatPriceString(contractStats.lost_collateral, 4) }}</div>
			</div>
		</div>
		<receive-modal v-if="modal === 'receiveTransaction'" @close="modal = null" />
		<transition name="fade" mode="out-in" appear>
			<stats v-if="showExtra" @close="showExtra = false" />
		</transition>
	</div>
</template>

<script>
import DonutGraph from '@/components/DonutGraph';
import ReceiveModal from '@/components/wallet/ReceiveModal';
import Stats from '@/components/dashboard/Stats';

import { mapState } from 'vuex';
import { formatPriceString, formatByteString } from '@/utils/format';

export default {
	components: {
		DonutGraph,
		ReceiveModal,
		Stats
	},
	data() {
		return {
			modal: null,
			showExtra: false
		};
	},
	computed: {
		...mapState({
			config: state => state.config,
			contractStats: state => state.hostContracts.stats,
			totalStorage: state => state.hostStorage.totalStorage,
			usedStorage: state => state.hostStorage.usedStorage
		}),
		contractsGraph() {
			let ongoingPct = 0,
				failedPct = 0,
				successfulPct = 0,
				unusedPct = 0,
				totalContracts = this.contractStats.contracts.total || 0;

			if (totalContracts > 0) {
				ongoingPct = this.contractStats.contracts.active / totalContracts;
				failedPct = this.contractStats.contracts.failed / totalContracts;
				unusedPct = this.contractStats.contracts.unused / totalContracts;
				successfulPct = this.contractStats.contracts.successful / totalContracts;
			}

			return [
				{
					title: 'Active Contracts',
					text: this.contractStats.contracts.active.toString(),
					value: ongoingPct,
					color: '#cfbb19'
				},
				{
					title: 'Unused Contracts',
					text: this.contractStats.contracts.unused.toString(),
					value: unusedPct,
					color: '#383838'
				},
				{
					title: 'Failed Contracts',
					text: this.contractStats.contracts.failed.toString(),
					value: failedPct,
					color: '#9b4343'
				},
				{
					title: 'Successful Contracts',
					text: this.contractStats.contracts.successful.toString(),
					value: successfulPct,
					color: '#19cf86'
				}
			];
		},
		storageGraph() {
			let usedPct = 0,
				freePct = 0;

			if (this.totalStorage.gt(0)) {
				usedPct = this.usedStorage.div(this.totalStorage).toNumber();
				freePct = this.totalStorage.minus(this.usedStorage).div(this.totalStorage).toNumber();
			}

			return [
				{
					title: 'Used Storage',
					text: formatByteString(this.usedStorage, 2),
					value: usedPct,
					color: '#19cf86'
				},
				{
					title: 'Free Storage',
					text: formatByteString(this.totalStorage.minus(this.usedStorage), 2),
					value: freePct,
					color: '#383838'
				}
			];
		}
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
	grid-template-columns: repeat(2, minmax(0, 1fr));
	align-items: center;
	grid-gap: 15px;
	overflow: hidden;
}

.graph {
	height: 80%;
}

.display-grid {
	padding: 15px;
	grid-area: auto / 1 / auto / span 2;
}

.wallet-controls {
	padding: 15px 5px;
	grid-area: auto / 1 / auto / span 2;
	text-align: right;
}
</style>
