<template>
	<div class="sia-status">
		<a :href="connectivityLink" target="_blank" class="sia-status-item connection-status">
			<div :class="connectionSeverity">
				<icon icon="wifi" />
			</div>
			<div class="sia-status-meta">
				<div class="sia-status-title">{{ connectionText }}</div>
				<div class="sia-status-text">Connectivity</div>
			</div>
		</a>
		<div class="sia-status-item">
			<div :class="{'sia-status-icon': true, 'status-warning': !synced }">
				<icon icon="redo" v-if="!synced" />
				<icon icon="check-circle" v-else />
			</div>
			<div class="sia-status-meta">
				<div class="sia-status-title">{{ formatNumber(blockHeight, 0) }}</div>
				<div class="sia-status-text">{{ statusText }}</div>
			</div>
		</div>
		<router-link :to="{ name: 'wallet' }" class="sia-status-item">
			<div :class="{'sia-status-icon': true, 'status-warning': !synced }">
				<icon icon="wallet" />
			</div>
			<div class="sia-status-meta">
				<div class="sia-status-title" v-html="walletBalanceDisplay" />
				<div class="sia-status-text">Balance</div>
			</div>
			<div class="sia-status-meta" v-if="pendingPayouts.gt(0)">
				<div class="sia-status-title" v-html="pendingPayoutDisplay" />
				<div class="sia-status-text">Pending Payout</div>
			</div>
		</router-link>
	</div>
</template>

<script>
import { mapState } from 'vuex';
import { formatPriceString, formatNumber, formatDuration } from '@/utils/format';

export default {
	computed: {
		...mapState({
			netAddress: state => state.netAddress,
			blockHeight: state => state.block.height,
			synced: state => state.synced,
			syncTime: state => state.syncTime,
			balance: state => state.hostWallet.balance,
			connection: state => state.explorer.report,
			dataUnit: state => state.config.data_unit,
			currency: state => state.config.currency,
			coinPrice: state => state.coinPrice,
			pendingPayouts: state => state.hostContracts.pendingPayouts
		}),
		statusText() {
			if (this.synced)
				return 'Synced';

			if (this.syncTime > 0)
				return `Syncing - ${formatDuration(this.syncTime / 1000, true)} remaining`;

			return 'Syncing';
		},
		connectionText() {
			switch (this.connection.severity) {
			case 'severe':
				return 'Connection Issue';
			case 'warning':
				return 'Warning';
			default:
				return 'Online';
			}
		},
		walletBalanceDisplay() {
			const sc = formatPriceString(this.balance, 2, 'sc', 1),
				disp = formatPriceString(this.balance, 2, this.currency, this.coinPrice[this.currency]);

			return `<div>${sc.value} <span class="currency-display">${sc.label}</span></div><div>${disp.value} <span class="currency-display">${disp.label}</span></div>`;
		},
		pendingPayoutDisplay() {
			const sc = formatPriceString(this.pendingPayouts, 2, 'sc', 1),
				disp = formatPriceString(this.pendingPayouts, 2, this.currency, this.coinPrice[this.currency]);

			return `<div>${sc.value} <span class="currency-display">${sc.label}</span></div><div>${disp.value} <span class="currency-display">${disp.label}</span></div>`;
		},
		connectivityLink() {
			const params = [];

			if (this.dataUnit && this.dataUnit.length > 0)
				params.push(`unit=${encodeURIComponent(this.dataUnit)}`);

			if (this.currency && this.currency.length > 0)
				params.push(`currency=${encodeURIComponent(this.currency)}`);

			return `https://troubleshoot.siacentral.com/results/${encodeURIComponent(this.netAddress)}?${params.join('&')}`;
		},
		connectionSeverity() {
			const classes = { 'sia-status-icon': true };

			switch (this.connection.severity) {
			case 'severe':
				classes['status-danger'] = true;
				break;
			case 'warning':
				classes['status-warning'] = true;
				break;
			}

			return classes;
		}
	},
	methods: {
		formatNumber
	}
};
</script>

<style lang="stylus" scoped>
.connection-status {
	cursor: pointer;
}

.sia-status {
	padding: 15px;
	border-bottom: 1px solid light-gray;
}

.sia-status-item {
	display: grid;
	column-gap: 15px;
	row-gap: 2px;
	grid-template-columns: 18px 1fr;
	align-items: center;
	margin-bottom: 15px;
	text-decoration: none;

	&:last-child {
		margin-bottom: 0;
	}

	.sia-status-icon {
		color: primary;
		grid-area: auto / 1 / span 2;

		&.status-warning {
			color: warning-accent;
		}

		&.status-danger {
			color: negative-accent;
		}

		svg.svg-inline--fa.svg-inline--fa {
			height: 18px;
			width: 18px;
		}
	}

	.sia-status-meta {
		grid-area: auto / 2;
	}

	.sia-status-title {
		font-size: 1rem;
		color: rgba(0, 0, 0, 0.87);
	}

	.sia-status-text {
		font-size: 0.8rem;
		color: rgba(0, 0, 0, 0.28);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
}

body.dark {
	.sia-status {
		background: #191919;
		border-color: dark-gray;

		.sia-status-title {
			color: rgba(255, 255, 255, 0.87);
		}

		.sia-status-text {
			color: rgba(255, 255, 255, 0.28);
		}
	}
}
</style>