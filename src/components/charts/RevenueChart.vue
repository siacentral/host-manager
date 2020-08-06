<template>
	<chart-display title="Revenue"
		:nodes="revenueData.data"
		:labels="revenueData.labels"
		:colors="revenueColors"
		:fills="revenueFills"
		@selected="onSelectRevenue">
		<div class="active-labels labels-revenue">
			<div class="chart-label line-primary">
				<div class="label-title">Earned</div>
				<div v-html="revenueEarnedLabel" />
			</div>
			<div class="chart-label line-secondary">
				<div class="label-title">Potential</div>
				<div v-html="revenuePotLabel" />
			</div>
		</div>
	</chart-display>
</template>

<script>
import { mapState } from 'vuex';
import BigNumber from 'bignumber.js';

import ChartDisplay from '@/components/charts/ChartDisplay';
import { formatPriceString } from '@/utils/format';

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
		...mapState({
			currency: state => state.config.currency,
			coinPrice: state => state.coinPrice
		}),
		revenueColors() {
			return [
				'#19bdcf',
				'#19cf86'
			];
		},
		revenueFills() {
			return [
				'#225e70',
				'#227051'
			];
		},
		revenueData() {
			return this.snapshots.reduce((d, s, i) => {
				const timestamp = s.timestamp,
					last = d.data[0].length - 1,
					prev = i - 1;

				timestamp.setMonth(timestamp.getMonth(), 1);

				if (i === 0) {
					d.data[0].push(new BigNumber(s.earned_revenue));
					d.data[1].push(new BigNumber(s.potential_revenue));
					d.labels.push(timestamp.toLocaleString([], {
						month: 'short',
						year: 'numeric'
					}));
					return d;
				}

				const prevTimestamp = this.snapshots[prev].timestamp;

				prevTimestamp.setMonth(prevTimestamp.getMonth(), 1);

				if (prevTimestamp.getTime() !== timestamp.getTime()) {
					d.data[0].push(new BigNumber(s.earned_revenue));
					d.data[1].push(new BigNumber(s.potential_revenue));
					d.labels.push(timestamp.toLocaleString([], {
						month: 'short',
						year: 'numeric'
					}));
				} else {
					d.data[0][last] = d.data[0][last].plus(new BigNumber(s.earned_revenue));
					d.data[1][last] = d.data[1][last].plus(s.potential_revenue);
				}

				return d;
			}, {
				data: [[], []],
				labels: []
			});
		},
		revenueEarnedLabel() {
			let i = this.active;

			if (i === -1 || i >= this.revenueData.data[0].length)
				i = this.revenueData.data[0].length - 4;

			const v = this.revenueData.data[0][i],
				sc = formatPriceString(v),
				curr = formatPriceString(v, 2, this.currency, this.coinPrice[this.currency]);

			return [
				`<div class="data-label">${sc.value}<span class="currency-display">${sc.label}</span></div>`,
				`<div class="data-label-secondary">${curr.value}<span class="currency-display">${curr.label}</span></div>`
			].join('');
		},
		revenuePotLabel() {
			let i = this.active;

			if (i === -1 || i >= this.revenueData.data[1].length)
				i = this.revenueData.data[1].length - 4;

			const v = this.revenueData.data[1][i],
				sc = formatPriceString(v),
				curr = formatPriceString(v, 2, this.currency, this.coinPrice[this.currency]);

			return [
				`<div class="data-label">${sc.value}<span class="currency-display">${sc.label}</span></div>`,
				`<div class="data-label-secondary">${curr.value}<span class="currency-display">${curr.label}</span></div>`
			].join('');
		}
	},
	methods: {
		onSelectRevenue(i) {
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
	grid-template-columns: repeat(2, minmax(0, 1fr));

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