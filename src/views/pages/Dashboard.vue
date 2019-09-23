<template>
	<div class="page page-dashboard">
		<div class="wallet-controls">
			<button class="btn btn-inline" @click="modal = 'receiveTransaction'"><icon icon="wallet" /> Receive Siacoin</button>
		</div>
		<donut-graph class="graph" :data="contractsGraph" :defaultIndex="0" icon="file-contract" />
		<donut-graph class="graph" :data="storageGraph" :defaultIndex="0" icon="hdd" />
		<div class="display-grid">
			<div class="grid-item">
				<div class="item-title">Potential Revenue</div>
				<div class="item-value">{{ formatPriceString(potentialRevenue, 4) }}</div>
			</div>
			<div class="grid-item">
				<div class="item-title">Earned Revenue</div>
				<div class="item-value">{{ formatPriceString(earnedRevenue, 4) }}</div>
			</div>
			<div class="grid-item item-negative">
				<div class="item-title">Lost Revenue</div>
				<div class="item-value">{{ formatPriceString(lostRevenue, 4) }}</div>
			</div>
			<div class="grid-item">
				<div class="item-title">Risked Collateral</div>
				<div class="item-value">{{ formatPriceString(riskedCollateral, 4) }}</div>
			</div>
			<div class="grid-item">
				<div class="item-title">Locked Collateral</div>
				<div class="item-value">{{ formatPriceString(lockedCollateral, 4) }}</div>
			</div>
			<div class="grid-item item-negative">
				<div class="item-title">Burnt Collateral</div>
				<div class="item-value">{{ formatPriceString(burntCollateral, 4) }}</div>
			</div>
		</div>
		<receive-modal v-if="modal === 'receiveTransaction'" @close="modal = null" />
	</div>
</template>

<script>
import DonutGraph from '@/components/DonutGraph';
import ReceiveModal from '@/components/wallet/ReceiveModal';

import { mapState } from 'vuex';
import { formatPriceString, formatByteString } from '@/utils/format';

export default {
	components: {
		DonutGraph,
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
			potentialRevenue: state => state.hostContracts.potentialRevenue,
			earnedRevenue: state => state.hostContracts.earnedRevenue,
			lostRevenue: state => state.hostContracts.lostRevenue,
			riskedCollateral: state => state.hostContracts.riskedCollateral,
			lockedCollateral: state => state.hostContracts.lockedCollateral,
			burntCollateral: state => state.hostContracts.burntCollateral,
			ongoingContracts: state => state.hostContracts.ongoingContracts,
			successfulContracts: state => state.hostContracts.successfulContracts,
			failedContracts: state => state.hostContracts.failedContracts,
			totalStorage: state => state.hostStorage.totalStorage,
			usedStorage: state => state.hostStorage.usedStorage
		}),
		contractsGraph() {
			let ongoingPct = 0,
				failedPct = 0,
				successfulPct = 0,
				totalContracts = this.ongoingContracts + this.successfulContracts + this.failedContracts;

			if (totalContracts > 0) {
				ongoingPct = this.ongoingContracts / totalContracts;
				failedPct = this.failedContracts / totalContracts;
				successfulPct = this.successfulContracts / totalContracts;
			}

			return [
				{
					title: 'Ongoing Contracts',
					text: this.ongoingContracts.toString(),
					value: ongoingPct,
					color: '#cfbb19'
				},
				{
					title: 'Failed Contracts',
					text: this.failedContracts.toString(),
					value: failedPct,
					color: '#9b4343'
				},
				{
					title: 'Successful Contracts',
					text: this.successfulContracts.toString(),
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
