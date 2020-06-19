<template>
	<setup-step>
		<template v-slot:info>
			<div class="setup-icon">
				<icon icon="wallet" />
			</div>
			<h3>Need Siacoin?</h3>
			<p>Hosts need Siacoin to form contracts with renters, usually {{minAmountStr}} is enough for new hosts to get started. Use the address below to send Siacoin to your host's wallet or buy Siacoin with a credit/debit card. Wallet balance will not show until after blockchain is fully synced.</p>
			<p>Synced: {{ syncedHeight }} / {{ targetHeight }} ({{ syncPercent }})</p>
			<p>Current Balance: {{walletBalanceStr}}</p>
		</template>
		<div class="receive-siacoin">
			<div class="control">
				<input type="text" class="receive-address" :value="address" readonly />
			</div>
			<button class="btn btn-inline" @click="onCopyAddress"><icon icon="copy" /></button>
			<div class="buy-button">
				<button class="btn btn-inline" @click="onBuySiacoin">Buy Siacoin</button>
			</div>
		</div>
		<template v-slot:controls>
			<button class="btn btn-success btn-inline" @click="$emit('done', { inc: 1 })">Done</button>
		</template>
	</setup-step>
</template>

<script>
import log from 'electron-log';
import { mapState, mapActions } from 'vuex';
import { clipboard } from 'electron';
import Transak from '@transak/transak-sdk';
import { formatSiacoinString, formatNumber } from '@/utils/format';
import BigNumber from 'bignumber.js';

import SetupStep from './SetupStep';

export default {
	components: {
		SetupStep
	},
	computed: {
		...mapState({
			address: state => state.hostWallet.lastAddress,
			balance: state => state.hostWallet.balance,
			coinPrice: state => state.coinPrice,
			block: state => state.block
		}),
		walletBalanceStr() {
			return formatSiacoinString(this.balance, 2);
		},
		minAmountSC() {
			return new BigNumber(Math.ceil((5 / this.coinPrice['usd']) / 1000) * 1000).times(1e24);
		},
		minAmountStr() {
			return formatSiacoinString(this.minAmountSC, 2);
		},
		syncedHeight() {
			return formatNumber(this.block.height);
		},
		targetHeight() {
			return formatNumber(this.block.target);
		},
		syncPercent() {
			return `${formatNumber(Math.ceil(this.block.height / this.block.target) * 100, 0)}%`;
		}
	},
	methods: {
		...mapActions(['pushNotification']),
		onCopyAddress() {
			try {
				clipboard.writeText(this.address);

				this.pushNotification({
					message: 'Successfully copied to clipboard',
					icon: 'copy'
				});
			} catch (ex) {
				log.error('receive siacoin copy', ex.message);
			}
		},
		async onBuySiacoin() {
			try {
				const transak = new Transak({
					apiKey: process.env.VUE_APP_TRANSAK_KEY,
					environment: 'PRODUCTION',
					cryptoCurrencyCode: 'SC',
					walletAddress: this.address,
					themeColor: '19cf86',
					countryCode: 'US',
					widgetHeight: `${window.innerHeight * 0.8}px`,
					hostURL: window.location.origin
				});

				transak.init();

				// To get all the events
				transak.on(transak.ALL_EVENTS, (data) => {
					console.log(data);
				});

				// This will trigger when the user marks payment is made.
				transak.on(transak.EVENTS.TRANSAK_ORDER_SUCCESSFUL, (orderData) => {
					console.log(orderData);
					transak.close();
				});
			} catch (ex) {
				console.error('ReceiveModal.onBuySiacoin', ex);
				this.pushNotification({
					severity: 'danger',
					message: ex.message
				});
			}
		}
	}
};
</script>

<style lang="stylus" scoped>
.receive-siacoin {
	display: grid;
	grid-template-rows: minmax(0, 1fr) auto;
	grid-template-columns: minmax(0, 1fr) auto;
	grid-gap: 30px 15px;
}

.receive-qr-code, .buy-button {
	text-align: center;
	grid-column: 1 / span 2;
}

.qr-code {
	padding: 15px;
	background: dark-gray;
	border-radius: 8px;
	width: 150px;
	height: 150px;
}

.control {
	margin: 0;
}

.btn > svg {
	margin: 0;
}
</style>
