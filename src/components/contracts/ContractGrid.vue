<template>
	<table>
		<thead>
			<tr>
				<td v-for="column in columns"
					:key="`header-${column.key}`"
					:class="{ 'contracts-header': true, 'contracts-sort': sort && sort.key === column.key }"
					@click="$emit('sort', column.key)">

					{{ column.text }}
					<icon icon="chevron-up" v-if="!sort.descending && sort && sort.key === column.key" />
					<icon icon="chevron-down" v-else-if="sort && sort.key === column.key" />
				</td>
				<td></td>
				<td></td>
			</tr>
		</thead>
		<tbody>
			<tr class="total-row">
				<td v-for="column in columns" :key="`totals-${column.key}`">
					{{ formatColumnTotal(column) }}
				</td>
				<td></td><td></td>
			</tr>
			<tr v-for="contract in contracts" :key="contract.obligation_id">
				<td v-for="column in columns" :key="column.key">
					<input class="contract-id" v-if="column.key === 'id'" :value="contract[column.key]" />
					<template v-else>{{ formatColumnValue(contract, column) }}</template>
				</td>
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
import { formatPriceString, formatByteString, formatShortDateString, formatBlockTimeString, formatFriendlyStatus } from '@/utils/formatLegacy';

export default {
	props: {
		columns: Array,
		contracts: Array,
		totals: Object,
		sort: Object
	},
	computed: {
		...mapState(['block'])
	},
	data() {
		return {
			showColumnSelect: false
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

td.column-select-column {
	z-index: 1000;

	.column-select-button {
		display: inline-block;
		background: none;
		padding: 0;
		border: none;
		outline: none;
		color: rgba(255, 255, 255, 0.84);

		&:hover, &:focus, &:active {
			color: primary;
			cursor: pointer;
		}
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

input.contract-id {
	display: block;
	padding: 0;
	max-width: 200px;
	background: transparent;
	border: none;
	outline: none;
	color: rgba(255, 255, 255, 0.84);
	font-size: 1rem;
	text-overflow: ellipsis;
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
