<template>
	<table>
		<thead>
			<tr>
				<td v-for="column in fixedColumns"
					:key="`header-${column.key}`"
					:class="{ 'contracts-header': true, 'contracts-sort': sortColumn && sortColumn.key === column.key }"
					@click="$emit('sort', column)">

					{{ column.text }}
					<icon icon="chevron-up" v-if="!sortDescending && sortColumn && sortColumn.key === column.key" />
					<icon icon="chevron-down" v-else-if="sortColumn && sortColumn.key === column.key" />
				</td>
				<td v-for="column in visibleColumns"
					:key="`header-${column.key}`"
					:class="{ 'contracts-header': true, 'contracts-sort': sortColumn && sortColumn.key === column.key }"
					@click="$emit('sort', column)">

					{{ column.text }}
					<icon icon="chevron-up" v-if="!sortDescending && sortColumn && sortColumn.key === column.key" />
					<icon icon="chevron-down" v-else-if="sortColumn && sortColumn.key === column.key" />
				</td>
				<td></td><td></td>
			</tr>
		</thead>
		<tbody>
			<tr class="total-row">
				<td v-for="column in fixedColumns" :key="`totals-${column.key}`">
					{{ formatColumnTotal(column) }}
				</td>
				<td v-for="column in visibleColumns" :key="`totals-${column.key}`">
					{{ formatColumnTotal(column) }}
				</td>
				<td></td><td></td>
			</tr>
			<tr v-for="contract in contracts" :key="contract.obligation_id">
				<td v-for="column in fixedColumns" :key="column.key">{{ formatColumnValue(contract, column) }}</td>
				<td v-for="column in visibleColumns" :key="column.key">{{ formatColumnValue(contract, column) }}</td>
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
		displayedColumns: Array,
		totals: Object,
		splitRevenue: Boolean,
		sortColumn: Object,
		sortDescending: Boolean
	},
	computed: {
		...mapState(['block']),
		visibleColumns() {
			return this.fixedColumns.concat(this.columns.filter(c => this.displayedColumns.indexOf(c.key) !== -1));
		}
	},
	data() {
		return {
			fixedColumns: [
				{
					text: 'ID',
					key: 'id',
					format: 'id'
				},
				{
					text: 'Status',
					key: 'status',
					format: 'status'
				}
			],
			columns: [
				{
					text: 'Sia Status',
					key: 'sia_status',
					format: 'status'
				},
				{
					text: 'Start Date',
					key: 'negotiation_timestamp',
					format: 'date'
				},
				{
					text: 'Expiration Date',
					key: 'expiration_timestamp',
					format: 'date'
				},
				{
					text: 'Est. Data Size',
					key: 'data_size',
					total_key: 'data_size',
					format: 'bytes'
				},
				{
					text: 'Locked Collateral',
					key: 'locked_collateral',
					total_key: 'locked_collateral',
					format: 'currency'
				},
				{
					text: 'Risked Collateral',
					key: 'risked_collateral',
					total_key: 'risked_collateral',
					format: 'currency'
				},
				{
					text: 'Returned Collateral',
					key: 'returned_collateral',
					total_key: 'returned_collateral',
					format: 'currency'
				},
				{
					text: 'Lost Collateral',
					key: 'burnt_collateral',
					total_key: 'burnt_collateral',
					format: 'currency'
				},
				{
					text: 'Contract Fee',
					key: 'contract_cost',
					total_key: 'contract_cost',
					format: 'currency'
				},
				{
					text: 'Est. Storage Revenue',
					key: 'storage_revenue',
					total_key: 'storage_revenue',
					format: 'currency'
				},
				{
					text: 'Est. Upload Revenue',
					key: 'upload_revenue',
					total_key: 'upload_revenue',
					format: 'currency'
				},
				{
					text: 'Est. Download Revenue',
					key: 'download_revenue',
					total_key: 'download_revenue',
					format: 'currency'
				},
				{
					text: 'Potential Revenue',
					key: 'potential_revenue',
					total_key: 'potential_revenue',
					format: 'currency'
				},
				{
					text: 'Earned Revenue',
					key: 'earned_revenue',
					total_key: 'earned_revenue',
					format: 'currency'
				},
				{
					text: 'Lost Revenue',
					key: 'lost_revenue',
					total_key: 'lost_revenue',
					format: 'currency'
				},
				{
					text: 'Revenue',
					key: 'revenue',
					total_key: 'revenue',
					format: 'currency'
				}
			]
		};
	},
	methods: {
		formatColumnTotal(column) {
			if (!column.total_key)
				return '';

			const value = this.totals[column.total_key],
				format = (column.format || '').toLowerCase();

			return this.formatValue(value, format);
		},
		formatColumnValue(contract, column) {
			const value = contract[column.key],
				format = (column.format || '').toLowerCase();

			return this.formatValue(value, format);
		},
		formatValue(value, format) {
			format = (format || '').toLowerCase();

			switch (format) {
			case 'id':
				if (!value)
					return '';

				return value.substr(0, 8);
			case 'status':
				if (!value)
					return '';

				return formatFriendlyStatus(value);
			case 'date':
				if (!value)
					return '';

				return formatShortDateString(value);
			case 'currency':
				if (!value)
					return formatPriceString(0, 4);

				return formatPriceString(value, 4);
			case 'bytes':
				if (!value)
					return formatByteString(0, 2);

				return formatByteString(value, 2);
			default:
				if (!value)
					return '';

				return value;
			}
		},
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
			return `https://siastats.info/navigator?search=${contract.id}`;
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
