<template>
	<div class="page page-contracts">
		<div class="controls">
			<div class="filter-text">{{ filterText }}</div>
			<button @click="onExport" class="btn btn-inline" :disabled="exporting"><icon icon="download" /> Export</button>
			<button @click="showFilter = true" class="btn btn-inline" :disabled="exporting"><icon icon="filter" /> Filter</button>
		</div>
		<div class="contracts">
			<empty-state v-if="count === 0" text="You have no contracts matching that filter" icon="file-contract" />
			<div v-else class="grid-wrapper">
				<contract-grid :contracts="filtered" :columns="visibleColumns" :totals="totals" :sort="sort" @sort="onSort" />
			</div>
		</div>
		<div class="contracts-pagination">
			<button class="btn btn-inline" @click="page -= 1" :disabled="page === 0 || count < perPage"><icon icon="chevron-left" /></button>
			<div class="page-text">{{ pageText }}</div>
			<button class="btn btn-inline" @click="page += 1" :disabled="perPage + (page * perPage) >= count || count < perPage"><icon icon="chevron-right" /></button>
		</div>
		<filter-panel v-show="showFilter" @close="showFilter = false" :columns="columns" :filter="filter" @filtered="onFiltered" :visible="displayColumns" @shown="onColShown" />
	</div>
</template>

<script>
import BigNumber from 'bignumber.js';
import { mapState, mapActions } from 'vuex';
import { promises as fs } from 'fs';
import log from 'electron-log';
import { EOL } from 'os';

import FilterPanel from '@/components/contracts/FilterPanel';
import ContractGrid from '@/components/contracts/ContractGrid';
import EmptyState from '@/components/EmptyState';

import { formatDate, formatCurrency, formatPriceString as formatPriceStringNew } from '@/utils/format';
import { formatPriceString, formatByteString, formatShortDateString, formatFriendlyStatus } from '@/utils/formatLegacy';
import { filteredContracts } from '@/sync/contracts';

export default {
	components: {
		ContractGrid,
		EmptyState,
		FilterPanel
	},
	data() {
		return {
			showFilter: false,
			exporting: false,
			filterDebounce: null,
			pageDebounce: null,
			filtered: [],
			filter: {},
			totals: {},
			count: 0,
			page: 0,
			perPage: 50,
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
					text: 'Renewed',
					key: 'renewed',
					format: 'bool'
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
					text: 'Payout Date',
					key: 'payout_timestamp',
					format: 'datetime'
				},
				{
					text: 'Data Stored',
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
					text: 'Account Funding',
					key: 'account_funding',
					total_key: 'account_funding',
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
					text: 'Contract Payout',
					key: 'payout',
					total_key: 'payout',
					format: 'currency'
				},
				{
					text: 'Revenue',
					key: 'revenue',
					total_key: 'revenue',
					format: 'currency'
				},
				{
					text: 'Cost Basis',
					key: 'cost_basis',
					total_key: 'cost_basis',
					format: 'cost-basis'
				},
				{
					text: 'Base Exchange Rate',
					key: 'cost_basis_rate',
					format: 'cost-basis-rate'
				},
				{
					text: 'Gain/Loss',
					key: 'gain_loss',
					total_key: 'gain_loss',
					format: 'capital-gain-loss'
				}
			],
			displayColumns: [
				'negotiation_timestamp',
				'expiration_timestamp',
				'contract_cost',
				'locked_collateral',
				'revenue',
				'cost_basis'
			],
			sort: {
				key: 'expiration_timestamp',
				descending: false
			}
		};
	},
	beforeMount() {
		try {
			const visible = JSON.parse(localStorage.getItem('contracts_visible_columns'));

			if (Array.isArray(visible))
				this.displayColumns = visible;
		} catch (ex) { console.error(ex); }

		try {
			let filter = JSON.parse(localStorage.getItem('contracts_filter'));

			if (!filter)
				filter = { statuses: ['active'] };

			if (filter.start_date)
				filter.start_date = new Date(filter.start_date);

			if (filter.end_date)
				filter.end_date = new Date(filter.end_date);

			this.filter = {
				...filter
			};
		} catch (ex) { console.error(ex); }

		try {
			const sort = JSON.parse(localStorage.getItem('contracts_sort'));

			if (!sort)
				return;

			if (sort.key && typeof sort.key === 'string')
				this.sort.key = sort.key;

			if (sort.descending && typeof sort.descending === 'boolean')
				this.sort.descending = sort.descending;
		} catch (ex) { console.error(ex); }

		this.refreshContracts();
	},
	computed: {
		...mapState({
			stats: state => state.hostContracts.stats,
			coinPrice: state => state.coinPrice,
			currency: state => state.config.currency
		}),
		visibleColumns() {
			return this.fixedColumns.concat(this.columns.filter(c => this.displayColumns.indexOf(c.key) !== -1));
		},
		filterText() {
			const filter = this.filter || {};
			let statusFilter = '',
				dateFilter = '',
				valueFilter = '';

			if (Array.isArray(filter.statuses) && filter.statuses.length !== 0) {
				if (filter.statuses.length === 1)
					statusFilter = `${filter.statuses[0]} contracts`;
				else if (filter.statuses.length === 2)
					statusFilter = `${filter.statuses[0]} and ${filter.statuses[1]} contracts`;
				else
					statusFilter = `${filter.statuses.slice(0, filter.statuses.length - 1).join(', ')}, and ${filter.statuses[filter.statuses.length - 1]} contracts`;
			}

			if (filter.start_date && filter.end_date) {
				const start = formatShortDateString(filter.start_date),
					end = formatShortDateString(filter.end_date);

				if (start === end)
					dateFilter = `on ${start}`;
				else
					dateFilter = `between ${start} and ${end}`;
			} else if (filter.start_date)
				dateFilter = `after ${formatShortDateString(filter.start_date)}`;
			else if (filter.end_date)
				dateFilter = `before ${formatShortDateString(filter.end_date)}`;

			if (filter.revenue_min && filter.revenue_max) {
				const min = formatPriceString(filter.revenue_min),
					max = formatPriceString(filter.revenue_max);

				if (min === max)
					valueFilter = `with revenue equal to ${min}`;
				else
					valueFilter = `with revenue between ${min} and ${max}`;
			} else if (filter.revenue_min)
				valueFilter = `with revenue greater than ${formatPriceString(filter.revenue_min)}`;
			else if (filter.revenue_max)
				valueFilter = `with revenue less than ${formatPriceString(filter.revenue_max)}`;

			return `Showing ${this.count} ${statusFilter} ${dateFilter} ${valueFilter}`;
		},
		pageText() {
			if (this.count > this.perPage) {
				const start = this.page * this.perPage;
				let end = start + this.perPage;

				if (end > this.count)
					end = this.count;

				return `${start} - ${end}`;
			}

			return `${0} - ${this.count}`;
		},
		successRate() {
			const num = this.stats.contracts.successful;
			let denom = this.stats.contracts.successful + this.stats.contracts.failed;

			if (denom <= 0)
				denom = 1;

			return `${Math.ceil((num / denom) * this.perPage)}%`;
		}
	},
	methods: {
		...mapActions(['pushNotification']),
		formatValue(value, format) {
			format = (format || '').toLowerCase();

			switch (format) {
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
			case 'bool':
				return value ? 'Yes' : 'No';
			case 'datetime':
				return formatDate(value);
			default:
				if (!value)
					return '';
				return value;
			}
		},
		refreshContracts() {
			const { contracts, total, length } = filteredContracts({
				page: this.page,
				sort: this.sort,
				...this.filter
			});

			this.filtered = contracts;
			this.totals = total;
			this.count = length;
		},
		async onExport() {
			if (this.exporting)
				return;

			try {
				this.exporting = true;

				const { filePath, canceled } = await this.showSaveDialog({
					title: 'Export Contracts',
					defaultPath: 'contracts.csv',
					buttonLabel: 'Export',
					filters: [
						{ name: 'CSV', extensions: ['csv'] },
						{ name: 'All Files', extensions: ['*'] }
					]
				});

				if (!filePath || canceled)
					return;
				const exchangeRate = (this.filtered[0].expiration_exchange_rate.currency || 'usd').toUpperCase(),
					added = {},
					columns = this.visibleColumns.reduce((columns, c) => {
						const toAdd = [];
						if (c.key === 'cost_basis')
							toAdd.push({ key: 'earned_revenue', format: 'siacoin', text: 'Earned Revenue (SC)' }, { format: 'currency', text: `Cost Basis (${exchangeRate})` });
						else if (c.format === 'currency')
							toAdd.push({ ...c, text: `${c.text} (${exchangeRate})` }, { ...c, format: 'siacoin', text: `${c.text} (SC)` });
						else
							toAdd.push(c);

						columns.push(...toAdd.filter(c => !added[c.text]));
						toAdd.forEach(c => { added[c.text] = true; });
						return columns;
					}, []),
					csv = [columns.map(c => c.text).join(',')],
					{ contracts } = filteredContracts({
						sort: this.sort,
						...this.filter
					});

				contracts.forEach(v => {
					const row = columns.map(c => {
						if (c.format === 'siacoin')
							return formatPriceStringNew(v[c.key], 4, 'sc', 1).value;
						else if (c.text === `Cost Basis (${exchangeRate})`)
							return formatCurrency(v.earned_revenue, v.expiration_exchange_rate.rate, v.expiration_exchange_rate.currency, 'auto');
						else if (c.key === 'cost_basis_rate')
							return formatCurrency(v.expiration_exchange_rate.rate, 1, v.expiration_exchange_rate.currency, 'never', 4, 1);
						else if (c.key === 'gain_loss')
							return new BigNumber(this.coinPrice[this.currency]).minus(v.expiration_exchange_rate.rate).div(v.expiration_exchange_rate.rate).times(100).toFixed(2) + '%';

						return this.formatValue(v[c.key], c.format);
					});

					csv.push(row.map(v => `"${v}"`).join(','));
				});

				await fs.writeFile(filePath, csv.join(EOL));
				this.pushNotification({
					message: `${this.count} contracts exported`,
					icon: 'file-contract',
					severity: 'success'
				});
			} catch (ex) {
				log.error('onExport', ex.message);
				this.pushNotification({
					message: 'Export contracts failed',
					icon: 'file-contract',
					severity: 'danger'
				});
			} finally {
				this.exporting = false;
			}
		},
		onSort(column) {
			try {
				if (this.sort.key === column)
					this.sort.descending = !this.sort.descending;
				else
					this.sort.descending = true;

				this.sort.key = column;
				localStorage.setItem('contracts_sort', JSON.stringify(this.sort));
				this.refreshContracts();
			} catch (ex) {
				log.error('onSort', ex.message);
			}
		},
		onFiltered(filter) {
			localStorage.setItem('contracts_filter', JSON.stringify(filter));
			this.filter = filter;
		},
		onColShown(visible) {
			localStorage.setItem('contracts_visible_columns', JSON.stringify(visible));
			this.displayColumns = visible;
		}
	},
	watch: {
		filter() {
			window.clearTimeout(this.filterDebounce);
			this.filterDebounce = window.setTimeout(this.refreshContracts, 300);
		},
		page() {
			window.clearTimeout(this.pageDebounce);
			this.pageDebounce = window.setTimeout(this.refreshContracts, 300);
		}
	}
};
</script>

<style lang="stylus" scoped>
.controls {
	display: flex;
    grid-template-columns: minmax(0, 1fr) auto auto;
    justify-content: space-between;
    align-items: center;
	padding: 15px;

	.filter-text {
		flex: 1;
	}

	button {
		margin: 0;
		margin-right: 15px;

		&:last-child {
			margin: 0;
		}
	}

	.control {
		margin-right: 15px;
		margin-bottom: 0;

		&:last-of-type {
			margin-right: 0;
		}
	}
}
.page-contracts {
	display: grid;
	grid-template-rows: auto minmax(0, 1fr) auto;
	grid-template-columns: 100%;
	grid-gap: 0;
	overflow: hidden;
}

.contracts {
	width: 100%;
	height: 100%;

	.grid-wrapper {
		width: 100%;
		height: 100%;
		overflow: auto;
	}
}

.contracts-pagination {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 15px;

	.btn.btn {
		margin: 0;

		> svg {
			margin: 0;
		}
	}

	.page-text {
		margin: 0 15px;
	}
}

.slide-left-enter-active {
	transition: all .5s ease;
}

.slide-left-leave-active {
	transition: all .5s ease;
}

.slide-left-enter, .slide-left-leave-to {
	transform: translateX(300px);
	opacity: 0;
}

</style>
