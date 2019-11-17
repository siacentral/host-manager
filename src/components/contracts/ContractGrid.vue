<template>
	<table>
		<thead>
			<tr>
				<td :class="{ 'contracts-header': true, 'contracts-sort': sortColumn === 'negotiation_height' }" @click="$emit('sort', 'negotiation_height')">
					Start Date
					<icon icon="chevron-up" v-if="!sortDescending && sortColumn === 'negotiation_height'" />
					<icon icon="chevron-down" v-else-if="sortColumn === 'negotiation_height'" />
				</td>
				<td :class="{ 'contracts-header': true, 'contracts-sort': sortColumn === 'expiration_height' }" @click="$emit('sort', 'expiration_height')">
					Expiration Date
					<icon icon="chevron-up" v-if="!sortDescending && sortColumn === 'expiration_height'" />
					<icon icon="chevron-down" v-else-if="sortColumn === 'expiration_height'" />
				</td>
				<td :class="{ 'contracts-header': true, 'contracts-sort': sortColumn === 'status' }" @click="$emit('sort', 'status')">
					Status
					<icon icon="chevron-up" v-if="!sortDescending && sortColumn === 'status'" />
					<icon icon="chevron-down" v-else-if="sortColumn === 'status'" />
				</td>
				<td :class="{ 'contracts-header': true, 'contracts-sort': sortColumn === 'storage_revenue' }" @click="$emit('sort', 'storage_revenue')">
					Storage Revenue
					<icon icon="chevron-up" v-if="!sortDescending && sortColumn === 'storage_revenue'" />
					<icon icon="chevron-down" v-else-if="sortColumn === 'storage_revenue'" />
				</td>
				<td :class="{ 'contracts-header': true, 'contracts-sort': sortColumn === 'download_revenue' }" @click="$emit('sort', 'download_revenue')">
					Download Revenue
					<icon icon="chevron-up" v-if="!sortDescending && sortColumn === 'download_revenue'" />
					<icon icon="chevron-down" v-else-if="sortColumn === 'download_revenue'" />
				</td>
				<td :class="{ 'contracts-header': true, 'contracts-sort': sortColumn === 'upload_revenue' }" @click="$emit('sort', 'upload_revenue')">
					Upload Revenue
					<icon icon="chevron-up" v-if="!sortDescending && sortColumn === 'upload_revenue'" />
					<icon icon="chevron-down" v-else-if="sortColumn === 'upload_revenue'" />
				</td>
				<td :class="{ 'contracts-header': true, 'contracts-sort': sortColumn === 'total_revenue' }" @click="$emit('sort', 'total_revenue')">
					Total Revenue
					<icon icon="chevron-up" v-if="!sortDescending && sortColumn === 'total_revenue'" />
					<icon icon="chevron-down" v-else-if="sortColumn === 'total_revenue'" />
				</td>
				<td></td><td></td>
			</tr>
		</thead>
		<tbody>
			<tr class="total-row">
				<td>Total</td>
				<td></td>
				<td></td>
				<td>{{ formatPriceString(totals.storage_revenue, 4) }}</td>
				<td>{{ formatPriceString(totals.download_revenue, 4) }}</td>
				<td>{{ formatPriceString(totals.upload_revenue, 4) }}</td>
				<td>{{ formatPriceString(totals.total_revenue, 4) }}</td>
				<td></td><td></td>
			</tr>
			<tr v-for="contract in contracts" :key="contract.obligation_id">
				<td>{{ formatShortDateString(contract.negotation_timestamp) }}</td>
				<td>{{ formatShortDateString(contract.expiration_timestamp) }}</td>
				<td>{{ formatFriendlyStatus(contract.status) }}</td>
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
import { formatPriceString, formatByteString, formatShortDateString, formatBlockTimeString, formatFriendlyStatus } from '@/utils/format';

export default {
	props: {
		contracts: Array,
		totals: Object,
		splitRevenue: Boolean,
		sortColumn: String,
		sortDescending: Boolean
	},
	computed: {
		...mapState(['block'])
	},
	methods: {
		formatPriceString,
		formatByteString,
		formatShortDateString,
		formatFriendlyStatus,
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
td.contracts-header {
	cursor: pointer;

	&.contracts-sort, &:hover {
		color: primary;
	}
}

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
