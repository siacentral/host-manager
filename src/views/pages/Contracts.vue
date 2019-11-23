<template>
	<div class="page page-contracts">
		<div class="controls">
			<div class="filter-text">{{ filterText }}</div>
			<button @click="onExport" class="btn btn-inline" :disabled="filterClosing || exporting"><icon icon="download" /> Export</button>
			<button @click="onFilterShow" class="btn btn-inline" :disabled="filterClosing || exporting"><icon icon="filter" /> Filter</button>
		</div>
		<div class="display-grid">
			<div class="grid-item item-warning">
				<div class="item-title">Potential Revenue</div>
				<div class="item-value">{{ formatPriceString(totals.potential_revenue, 4) }}</div>
			</div>
			<div class="grid-item">
				<div class="item-title">Earned Revenue</div>
				<div class="item-value">{{ formatPriceString(totals.earned_revenue, 4) }}</div>
			</div>
			<div class="grid-item item-negative">
				<div class="item-title">Lost Revenue</div>
				<div class="item-value">{{ formatPriceString(totals.lost_revenue, 4) }}</div>
			</div>
			<div class="grid-item item-warning">
				<div class="item-title">Risked Collateral</div>
				<div class="item-value">{{ formatPriceString(totals.risked_collateral, 4) }}</div>
			</div>
			<div class="grid-item">
				<div class="item-title">Locked Collateral</div>
				<div class="item-value">{{ formatPriceString(totals.locked_collateral, 4) }}</div>
			</div>
			<div class="grid-item item-negative">
				<div class="item-title">Burnt Collateral</div>
				<div class="item-value">{{ formatPriceString(totals.lost_collateral, 4) }}</div>
			</div>
		</div>
		<div class="contracts">
			<empty-state v-if="filtered.length === 0" text="You have no contracts matching that filter" icon="file-contract" />
			<div v-else class="grid-wrapper">
				<contract-grid :contracts="pageContracts" :totals="totals" :sortColumn="sortColumn" :sortDescending="sortDescending" @sort="onSort" />
			</div>
		</div>
		<div class="contracts-pagination">
			<button class="btn btn-inline" @click="page -= 1" :disabled="page === 0 || filtered.length < perPage"><icon icon="chevron-left" /></button>
			<div class="page-text">{{ pageText }}</div>
			<button class="btn btn-inline" @click="page += 1" :disabled="perPage + (page * perPage) >= filtered.length || filtered.length < perPage"><icon icon="chevron-right" /></button>
		</div>
		<filter-panel v-if="showFilter" @close="onFilterClose" />
	</div>
</template>

<script>
import { mapState } from 'vuex';
import { promises as fs } from 'fs';
import log from 'electron-log';
import BigNumber from 'bignumber.js';
import { EOL } from 'os';

import FilterPanel from '@/components/contracts/FilterPanel';
import ContractGrid from '@/components/contracts/ContractGrid';
import EmptyState from '@/components/EmptyState';

import { formatPriceString, formatByteString, formatShortDateString, formatFriendlyStatus } from '@/utils/format';
import { writeConfig, showSaveDialogAsync } from '@/utils';

export default {
	components: {
		ContractGrid,
		EmptyState,
		FilterPanel
	},
	data() {
		return {
			showFilter: false,
			filterClosing: false,
			exporting: false,
			filtered: [],
			totals: {},
			page: 0,
			perPage: 50,
			sortColumn: 'expiration_height',
			sortDescending: false
		};
	},
	beforeMount() {
		this.filterContracts();
	},
	computed: {
		...mapState({
			contracts: state => state.hostContracts.contracts,
			stats: state => state.hostContracts.stats,
			config: state => state.config
		}),
		filterText() {
			const filter = this.config.contract_filter || {};
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

			return `Showing ${this.filtered.length} ${statusFilter} ${dateFilter} ${valueFilter}`;
		},
		pageText() {
			if (this.filtered.length > this.perPage) {
				let start = this.page * this.perPage,
					end = start + this.perPage;

				if (end > this.filtered.length)
					end = this.filtered.length;

				return `${start} - ${end}`;
			}

			return `${0} - ${this.filtered.length}`;
		},
		pageContracts() {
			if (this.filtered.length > this.perPage) {
				let start = this.page * this.perPage,
					end = start + this.perPage;

				if (end >= this.filtered.length)
					end = this.filtered.length;

				return this.filtered.slice(start, end);
			}

			return this.filtered;
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
		formatByteString,
		formatPriceString,
		filterContracts() {
			try {
				const filter = this.config.contract_filter || {},
					total = {
						risked_collateral: new BigNumber(0),
						locked_collateral: new BigNumber(0),
						lost_collateral: new BigNumber(0),
						download_revenue: new BigNumber(0),
						upload_revenue: new BigNumber(0),
						storage_revenue: new BigNumber(0),
						potential_revenue: new BigNumber(0),
						earned_revenue: new BigNumber(0),
						lost_revenue: new BigNumber(0),
						total_revenue: new BigNumber(0)
					},
					contracts = this.contracts.reduce((val, c) => {
						let added = false;

						if (filter.statuses.indexOf('unused') === -1 && c.unused)
							return val;

						if (filter.start_date && filter.start_date > c.expiration_timestamp)
							return val;

						if (filter.end_date && filter.end_date < c.expiration_timestamp)
							return val;

						if (filter.revenue_min && filter.revenue_min.gt(c.total_revenue))
							return val;

						if (filter.revenue_max && filter.revenue_max.lt(c.total_revenue))
							return val;

						if (filter.statuses.length === 1 && filter.statuses.indexOf('unused') !== -1 && c.unused) {
							val.push(c);
							added = true;
						}

						if (!added && filter.statuses.indexOf('active') !== -1 && c.status === 'obligationUnresolved') {
							total.potential_revenue = total.potential_revenue.plus(c.total_revenue);
							total.risked_collateral = total.risked_collateral.plus(c.risked_collateral);
							total.locked_collateral = total.locked_collateral.plus(c.locked_collateral);

							val.push(c);
							added = true;
						}

						if (!added && filter.statuses.indexOf('successful') !== -1 && c.status === 'obligationSucceeded') {
							total.earned_revenue = total.earned_revenue.plus(c.total_revenue);

							val.push(c);
							added = true;
						}

						if (!added && filter.statuses.indexOf('failed') !== -1 && c.status === 'obligationFailed') {
							total.lost_revenue = total.lost_revenue.plus(c.total_revenue);
							total.lost_collateral = total.lost_collateral.plus(c.burnt_collateral);

							val.push(c);
							added = true;
						}

						total.download_revenue = total.download_revenue.plus(c.download_revenue);
						total.upload_revenue = total.upload_revenue.plus(c.upload_revenue);
						total.storage_revenue = total.storage_revenue.plus(c.storage_revenue);
						total.total_revenue = total.total_revenue.plus(c.total_revenue);

						if (c.status === 'obligationUnresolved')
							total.risked_collateral = total.risked_collateral.plus(c.risked_collateral);

						return val;
					}, []);

				this.filtered = contracts;
				this.totals = total;

				this.sortContracts();
			} catch (ex) {
				log.error('onFilterContracts', ex.message);
			}
		},
		sortContracts() {
			this.filtered.sort((a, b) => {
				a = a[this.sortColumn];
				b = b[this.sortColumn];

				switch (this.sortColumn) {
				case 'status':
					a = formatFriendlyStatus(a).toLowerCase();
					b = formatFriendlyStatus(b).toLowerCase();

					if (a > b && this.sortDescending)
						return -1;
					else if (a > b)
						return 1;

					if (a < b && this.sortDescending)
						return 1;
					else if (a < b)
						return -1;

					return 0;
				case 'negotiation_height':
				case 'expiration_height':
					if (a > b && this.sortDescending)
						return -1;
					else if (a > b)
						return 1;

					if (a < b && this.sortDescending)
						return 1;
					else if (a < b)
						return -1;

					return 0;
				case 'storage_revenue':
				case 'download_revenue':
				case 'upload_revenue':
				case 'total_revenue':
					const agtB = a.gt(b);

					if (agtB && this.sortDescending)
						return -1;
					else if (agtB)
						return 1;

					const altB = a.lt(b);

					if (altB && this.sortDescending)
						return 1;
					else if (altB)
						return -1;

					return 0;
				default:
					return -1;
				}
			});
		},
		async onExport() {
			if (this.exporting)
				return;

			try {
				this.exporting = true;

				const filePath = await showSaveDialogAsync({
					title: 'Export Contracts',
					defaultPath: 'contracts.csv',
					buttonLabel: 'Export',
					filters: [
						{ name: 'CSV', extensions: ['csv'] },
						{ name: 'All Files', extensions: ['*'] }
					]
				});

				if (!filePath)
					return;

				const csv = [['"Contract ID"', '"Status"', '"Start Date"', '"End Date"', '"Proof Deadline"',
					'"Locked Collateral"', '"Risked Collateral"', '"Contract Cost"', '"Transaction Fees"',
					'"Storage Revenue"', '"Upload Revenue"', '"Download Revenue"', '"Total Revenue"'].join(',')];

				this.filtered.forEach(c => {
					const row = [
						`"${c.obligation_id}"`,
						`"${formatFriendlyStatus(c.status)}"`,
						`"${formatShortDateString(c.negotiation_timestamp)}"`,
						`"${formatShortDateString(c.expiration_timestamp)}"`,
						`"${formatShortDateString(c.proof_deadline_timestamp)}"`,
						`${c.locked_collateral.toString(10)}`,
						`${c.risked_collateral.toString(10)}`,
						`${c.contract_cost.toString(10)}`,
						`${c.transaction_fees.toString(10)}`,
						`${c.storage_revenue.toString(10)}`,
						`${c.upload_revenue.toString(10)}`,
						`${c.download_revenue.toString(10)}`,
						`${c.total_revenue.toString(10)}`
					];

					csv.push(row.join(','));
				});

				await fs.writeFile(filePath, csv.join(EOL));
			} catch (ex) {
				log.error('onExport', ex.message);
			} finally {
				this.exporting = false;
			}
		},
		onSort(column) {
			try {
				if (this.sortColumn === column)
					this.sortDescending = !this.sortDescending;
				else
					this.sortDescending = true;

				this.sortColumn = column;
				this.sortContracts();
			} catch (ex) {
				log.error('onSort', ex.message);
			}
		},
		async onFilterClose() {
			if (this.filterClosing)
				return;

			try {
				this.filterClosing = true;
				await writeConfig(this.config);
			} catch (ex) {
				log.error('onFilterClose', ex.message);
			} finally {
				this.filterClosing = false;
				this.showFilter = false;
			}
		},
		onFilterShow() {
			try {
				if (this.filterClosing)
					return;

				this.showFilter = true;
			} catch (ex) {
				log.error('onFilterShow', ex.message);
			}
		}
	},
	watch: {
		config() {
			this.filterContracts();
		},
		contracts() {
			this.filterContracts();
		},
		filtered() {
			if (this.page * this.perPage >= this.filtered.length)
				this.page = 0;
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
	grid-template-rows: auto auto minmax(0, 1fr) auto;
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
