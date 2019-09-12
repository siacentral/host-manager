<template>
	<div class="sia-status">
		<!-- at the top to prevent the :last-child selector from firing -->
		<receive-modal v-if="modal === 'receiveTransaction'" @close="modal = null" />
		<a :href="connectivityLink" target="_blank" class="sia-status-item connection-status">
			<div :class="connectionSeverity">
				<icon icon="wifi" />
			</div>
			<div class="sia-status-title">{{ connection.connectable ? (connection.message ? 'Config Issue' : 'Working') : 'Connection Issue' }}</div>
			<div class="sia-status-text">Connectivity</div>
		</a>
		<div class="sia-status-item">
			<div :class="{'sia-status-icon': true, 'status-warning': !synced }">
				<icon icon="redo" v-if="!synced" />
				<icon icon="check-circle" v-else />
			</div>
			<div class="sia-status-title">{{ formatNumber(blockHeight, 0) }}</div>
			<div class="sia-status-text">{{ statusText }}</div>
		</div>
		<a href="#" class="sia-status-item" @click.prevent="modal = 'receiveTransaction'">
			<div :class="{'sia-status-icon': true, 'status-warning': !synced }">
				<icon icon="wallet" />
			</div>
			<div class="sia-status-title">
				{{ formatPriceString(balance, 2) }}
			</div>
			<div class="sia-status-text">Balance</div>
		</a>
	</div>
</template>

<script>
import ReceiveModal from '@/components/wallet/ReceiveModal';

import { mapState } from 'vuex';
import { formatDuration, formatPriceString, formatNumber } from '@/utils/format';

export default {
	components: {
		ReceiveModal
	},
	data() {
		return {
			modal: null
		};
	},
	computed: {
		...mapState({
			netAddress: state => state.netAddress,
			blockHeight: state => state.blockHeight,
			synced: state => state.synced,
			syncTime: state => state.syncTime,
			balance: state => state.hostWallet.balance,
			connection: state => state.explorer.report
		}),
		statusText() {
			if (this.synced)
				return 'Synced';

			if (this.syncTime > 0)
				return `Syncing - ${formatDuration(this.syncTime / 1000, true)} remaining`;

			return 'Syncing';
		},
		connectivityLink() {
			return `https://troubleshoot.siacentral.com/results/${encodeURIComponent(this.netAddress)}`;
		},
		connectionSeverity() {
			const classes = { 'sia-status-icon': true };

			if (!this.connection.connectable)
				classes['status-danger'] = true;
			else if (this.connection.message)
				classes['status-warning'] = true;

			return classes;
		}
	},
	methods: {
		formatPriceString,
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

	.sia-status-title {
		font-size: 1rem;
		color: rgba(0, 0, 0, 0.87);
		grid-area: auto / 2;
	}

	.sia-status-text {
		grid-area: auto / 2;
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