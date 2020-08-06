<template>
	<chart-display title="Contracts"
		:nodes="contractData.data"
		:labels="contractData.labels"
		:colors="contractColors"
		:fills="contractFills"
		@selected="onSelectContracts">
		<div class="active-labels labels-contract">
			<div class="chart-label line-primary">
				<div class="label-title">Successful</div>
				<div v-html="contractSuccessLabel" />
			</div>
			<div class="chart-label line-tertiary">
				<div class="label-title">Failed</div>
				<div v-html="contractFailLabel" />
			</div>
			<div class="chart-label line-secondary">
				<div class="label-title">Expiring</div>
				<div v-html="contractActiveLabel" />
			</div>
		</div>
	</chart-display>
</template>

<script>
import BigNumber from 'bignumber.js';

import ChartDisplay from '@/components/charts/ChartDisplay';
import { formatNumber } from '@/utils/formatLegacy';

export default {
	components: {
		ChartDisplay
	},
	props: {
		snapshots: Array
	},
	data() {
		return {
			active: -1
		};
	},
	computed: {
		contractColors() {
			return [
				'#19bdcf',
				'#da5454',
				'#19cf86'
			];
		},
		contractFills() {
			return [
				'#225e70',
				'#843b3b',
				'#227051'
			];
		},
		contractData() {
			return this.snapshots.reduce((d, s, i) => {
				const timestamp = s.timestamp,
					last = d.data[0].length - 1,
					prev = i - 1;

				if (i === 0) {
					d.data[0].push(new BigNumber(s.successful_contracts));
					d.data[1].push(new BigNumber(s.failed_contracts));
					d.data[2].push(new BigNumber(s.expired_contracts));
					d.labels.push(timestamp.toLocaleString([], {
						month: 'short',
						year: 'numeric'
					}));
					return d;
				}

				const prevTimestamp = this.snapshots[prev].timestamp;

				if (prevTimestamp.getTime() !== timestamp.getTime()) {
					d.data[0].push(new BigNumber(s.successful_contracts));
					d.data[1].push(new BigNumber(s.failed_contracts));
					d.data[2].push(new BigNumber(s.expired_contracts));
					d.labels.push(timestamp.toLocaleString([], {
						month: 'short',
						year: 'numeric'
					}));
				} else {
					d.data[0][last] = d.data[0][last].plus(new BigNumber(s.successful_contracts));
					d.data[1][last] = d.data[1][last].plus(new BigNumber(s.failed_contracts));
					d.data[2][last] = d.data[2][last].plus(new BigNumber(s.expired_contracts));
				}

				return d;
			}, {
				data: [[], [], []],
				labels: []
			});
		},
		contractSuccessLabel() {
			let i = this.active;

			if (i === -1 || i >= this.contractData.data[0].length)
				i = this.contractData.data[0].length - 4;

			const v = this.contractData.data[0][i];

			return `<div class="data-label">${formatNumber(v)}`;
		},
		contractFailLabel() {
			let i = this.active;

			if (i === -1 || i >= this.contractData.data[1].length)
				i = this.contractData.data[1].length - 4;

			const v = this.contractData.data[1][i];

			return `<div class="data-label">${formatNumber(v)}`;
		},
		contractActiveLabel() {
			let i = this.active;

			if (i === -1 || i >= this.contractData.data[2].length)
				i = this.contractData.data[2].length - 4;

			const v = this.contractData.data[2][i];

			return `<div class="data-label">${formatNumber(v)}`;
		}
	},
	methods: {
		onSelectContracts(i) {
			try {
				this.active = i;
			} catch (ex) {
				console.error(ex);
			}
		}
	}
};
</script>

<style lang="stylus" scoped>
.active-labels {
	display: grid;
	grid-gap: 10px;
	justify-items: center;
	text-align: right;
	font-size: 1rem;
	grid-template-columns: repeat(3, minmax(0, 1fr));

	.chart-label {
		display: grid;
		grid-gap: 15px;
		grid-template-columns: repeat(2, auto);
		align-items: center;
	}

	.label-title {
		text-align: center;
		font-size: 0.8rem;
	}

	.line-primary {
		color: #19cf86;
	}

	.line-secondary {
		color: #19bdcf;
	}

	.line-tertiary {
		color: #da5454;
	}
}
</style>