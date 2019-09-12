<template>
	<table>
		<thead>
			<tr>
				<td v-if="filterMode === 'obligationUnresolved'">Estimated Expiration</td>
				<td v-else>Expiration</td>
				<td>Data Size</td>
				<td v-if="filterMode === 'obligationUnresolved'">Risked Collateral</td>
				<td v-if="filterMode === 'obligationFailed'">Burnt Collateral</td>
				<td v-if="filterMode === 'obligationSucceeded'">Returned Collateral</td>
				<td v-if="splitRevenue">Contract Fees</td>
				<td v-if="!splitRevenue && filterMode === 'obligationFailed'">Lost Revenue</td>
				<td v-else-if="!splitRevenue && filterMode === 'obligationSucceeded'">Earned Revenue</td>
				<td v-else-if="!splitRevenue">Potential Revenue</td>
				<td v-if="splitRevenue">Download Revenue</td>
				<td v-if="splitRevenue">Upload Revenue</td>
				<td v-if="splitRevenue">Storage Revenue</td>
				<td></td>
				<td></td>
			</tr>
		</thead>
		<tbody>
			<tr class="total-row">
				<td>Total</td>
				<td>{{ formatByteString(totals.data_size, 2) }}</td>
				<td v-if="filterMode === 'obligationUnresolved'">{{ formatPriceString(totals.risked_collateral, 4) }}</td>
				<td v-if="filterMode === 'obligationSucceeded'">{{ formatPriceString(totals.locked_collateral.plus(totals.risked_collateral), 4) }}</td>
				<td v-if="filterMode === 'obligationFailed'"> {{formatPriceString(totals.burnt_collateral, 4) }}</td>
				<td v-if="splitRevenue">{{ formatPriceString(totals.transaction_fees_added.plus(totals.totals_cost), 4) }}</td>
				<td v-if="!splitRevenue">{{ formatPriceString(totals.total_revenue, 4) }}</td>
				<td v-if="splitRevenue">{{ formatPriceString(totals.download_revenue, 4) }}</td>
				<td v-if="splitRevenue">{{ formatPriceString(totals.upload_revenue, 4) }}</td>
				<td v-if="splitRevenue">{{ formatPriceString(totals.storage_revenue, 4) }}</td>
				<td></td><td></td>
			</tr>
			<tr v-for="contract in contracts" :key="contract.obligation_id">
				<td v-if="filterMode !== 'obligationUnresolved'">{{ formatShortDateString(contract.expiration_timestamp) }}</td>
				<td v-else>{{ formatExpirationString(contract.expiration_height.minus(blockHeight)) }}</td>
				<td>{{ formatByteString(contract.data_size, 2) }}</td>
				<td v-if="filterMode === 'obligationUnresolved'">{{ formatPriceString(contract.risked_collateral, 4) }}</td>
				<td v-if="filterMode === 'obligationSucceeded'">{{ formatPriceString(contract.locked_collateral.plus(contract.risked_collateral), 4) }}</td>
				<td v-if="filterMode === 'obligationFailed'"> {{formatPriceString(contract.burnt_collateral, 4) }}</td>
				<td v-if="splitRevenue">{{ formatPriceString(contract.transaction_fees_added.plus(contract.contract_cost), 4) }}</td>
				<td v-if="!splitRevenue">{{ formatPriceString(contract.total_revenue, 4) }}</td>
				<td v-if="splitRevenue">{{ formatPriceString(contract.download_revenue, 4) }}</td>
				<td v-if="splitRevenue">{{ formatPriceString(contract.upload_revenue, 4) }}</td>
				<td v-if="splitRevenue">{{ formatPriceString(contract.storage_revenue, 4) }}</td>
				<td class="fit-text">
					<span :class="getTagClasses(tag)" v-for="(tag, i) in contract.tags" :key="i">{{ tag.text }}</span>
				</td>
				<td class="fit-text"><a :href="getSiaStatsLink(contract)" target="_blank"><icon icon="external-link-alt" />SiaStats</a></td>
			</tr>
		</tbody>
	</table>
</template>

<script>
import { BigNumber } from 'bignumber.js';
import { mapState } from 'vuex';
import { formatPriceString, formatByteString, formatShortDateString, formatBlockTimeString } from '@/utils/format';

export default {
	props: {
		contracts: Array,
		filterMode: String,
		splitRevenue: Boolean
	},
	computed: {
		...mapState(['blockHeight']),
		totals() {
			const totals = {
				data_size: new BigNumber(0),
				risked_collateral: new BigNumber(0),
				locked_collateral: new BigNumber(0),
				burnt_collateral: new BigNumber(0),
				transaction_fees_added: new BigNumber(0),
				totals_cost: new BigNumber(0),
				total_revenue: new BigNumber(0),
				download_revenue: new BigNumber(0),
				upload_revenue: new BigNumber(0),
				storage_revenue: new BigNumber(0)
			};

			return this.contracts.reduce((totals, c) => {
				totals.data_size = totals.data_size.plus(c.data_size);
				totals.risked_collateral = totals.risked_collateral.plus(c.risked_collateral);
				totals.locked_collateral = totals.locked_collateral.plus(c.locked_collateral);
				totals.burnt_collateral = totals.burnt_collateral.plus(c.burnt_collateral);
				totals.transaction_fees_added = totals.transaction_fees_added.plus(c.transaction_fees_added);
				totals.totals_cost = totals.totals_cost.plus(c.contract_cost);
				totals.total_revenue = totals.total_revenue.plus(c.total_revenue);
				totals.download_revenue = totals.download_revenue.plus(c.download_revenue);
				totals.upload_revenue = totals.upload_revenue.plus(c.upload_revenue);
				totals.storage_revenue = totals.storage_revenue.plus(c.storage_revenue);

				return totals;
			}, totals);
		}
	},
	methods: {
		formatPriceString,
		formatByteString,
		formatShortDateString,
		formatExpirationString(blocks) {
			if (blocks <= 0)
				return 'Expired';

			if (blocks >= 144)
				return formatShortDateString(new Date(Date.now() + (blocks * 6e5)));

			if (blocks < 8)
				return '< 1 hr';

			return formatBlockTimeString(blocks);
		},
		getTagClasses(tag) {
			const classes = { 'tag': true };

			classes[`tag-${tag.severity}`] = true;

			return classes;
		},
		getSiaStatsLink(contract) {
			return `https://siastats.info/navigator?search=${contract.obligation_id}`;
		}
	}
};
</script>

<style lang="stylus" scoped>
a {
	text-decoration: none;
	font-size: 0.8rem;
	color: primary;

	> svg {
		margin-right: 3px;
	}
}

span.tag {
	padding: 3px 8px;
	border: 1px solid #4c4c4c;
	border-radius: 20px;
	color: rgba(255,255,255,0.54);
	background: #232323;
	font-size: 0.8rem;
	margin-right: 5px;
	pointer-events: none;

	&:last-of-type {
		margin-right: 0;
	}

	&.tag-severe {
		background: negative-dark;
		border-color: negative-accent;
		color: rgba(255, 255, 255, 0.54);
	}

	&.tag-warning {
		background: warning-accent;
		border-color: warning-dark;
		color: rgba(0, 0, 0, 0.54);
	}
}
</style>
