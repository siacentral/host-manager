<template>
	<table>
		<thead>
			<tr>
				<td>Expiration</td>
				<td>Status</td>
				<td>Risked Collateral</td>
				<td>Storage Revenue</td>
				<td>Download Revenue</td>
				<td>Upload Revenue</td>
				<td>Total Revenue</td>
				<td></td><td></td>
			</tr>
		</thead>
		<tbody>
			<tr class="total-row">
				<td>Total</td>
				<td></td>
				<td>{{ formatPriceString(totals.risked_collateral) }}</td>
				<td>{{ formatPriceString(totals.storage_revenue, 4) }}</td>
				<td>{{ formatPriceString(totals.download_revenue, 4) }}</td>
				<td>{{ formatPriceString(totals.upload_revenue, 4) }}</td>
				<td>{{ formatPriceString(totals.total_revenue, 4) }}</td>
				<td></td><td></td>
			</tr>
			<tr v-for="contract in contracts" :key="contract.obligation_id">
				<td v-if="contract.expiration_height.minus(block.height).lt(0)">{{ formatShortDateString(contract.expiration_timestamp) }}</td>
				<td v-else>{{ formatExpirationString(contract.expiration_height.minus(block.height)) }}</td>
				<td>{{ getFriendlyStatus(contract.status) }}</td>
				<td>{{ formatPriceString(contract.risked_collateral, 4) }}</td>
				<td>{{ formatPriceString(contract.storage_revenue, 4) }}</td>
				<td>{{ formatPriceString(contract.download_revenue, 4) }}</td>
				<td>{{ formatPriceString(contract.upload_revenue, 4) }}</td>
				<td>{{ formatPriceString(contract.total_revenue, 4) }}</td>
				<td class="fit-text">
					<div class="tag-wrapper">
						<div :class="getTagClasses(tag)" v-for="(tag, i) in contract.tags" :key="i">{{ tag.text }}</div>
					</div>
				</td>
				<td class="fit-text"><a :href="getSiaStatsLink(contract)" target="_blank"><icon icon="external-link-alt" />SiaStats</a></td>
			</tr>
		</tbody>
	</table>
</template>

<script>
import { mapState } from 'vuex';
import { formatPriceString, formatByteString, formatShortDateString, formatBlockTimeString } from '@/utils/format';

export default {
	props: {
		contracts: Array,
		totals: Object,
		splitRevenue: Boolean
	},
	computed: {
		...mapState(['block'])
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
		getFriendlyStatus(status) {
			switch (status) {
			case 'obligationUnresolved':
				return 'Active';
			case 'obligationSucceeded':
				return 'Successful';
			case 'obligationFailed':
				return 'Failed';
			case 'obligationRejected':
				return 'Rejected';
			}

			return 'Unknown';
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

.tag-wrapper {
	display: grid;
	grid-template-columns: min-content;
	grid-gap: 5px;
}

.tag {
	width: 100%;
	padding: 3px 8px;
	border: 1px solid #4c4c4c;
	border-radius: 20px;
	color: rgba(255,255,255,0.54);
	background: #232323;
	font-size: 0.8rem;
	margin-right: 5px;
	pointer-events: none;
	text-align: center;

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
