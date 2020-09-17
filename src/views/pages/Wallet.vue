<template>
	<div class="page page-wallet">
		<div class="receive-qr-code">
			<AddressQRCode class="qr-code" :address="address" />
		</div>
		<div class="control">
			<input type="text" class="receive-address" :value="address" readonly />
		</div>
		<button class="btn btn-inline" @click="onCopyAddress"><icon icon="copy" /></button>
		<div class="buy-button">
			<button class="btn btn-inline" @click="onBuySiacoin">Buy Siacoin (PREVIEW)</button>
		</div>
	</div>
</template>

<script>
import log from 'electron-log';
import { mapState, mapActions } from 'vuex';
import { clipboard } from 'electron';
import Transak from '@transak/transak-sdk';

import AddressQRCode from '@/components/wallet/AddressQRCode';

export default {
	components: {
		AddressQRCode
	},
	computed: {
		...mapState({
			address: state => state.hostWallet.lastAddress
		})
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

				// This will trigger when the user closes the widget
				transak.on(transak.EVENTS.TRANSAK_WIDGET_CLOSE, () => {
					// transak widget annoyingly sets overflow to 'scroll' reset it back to auto
					document.querySelector('html').style.overflow = 'auto';
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
.page.page-wallet {
	display: grid;
	grid-template-columns: minmax(0, 1fr) auto;
	grid-gap: 30px 15px;
	align-content: safe center;
	justify-items: center;
	padding: 15px;
}

.receive-qr-code, .buy-button {
	text-align: center;
	grid-column: 1 / -1;
}

.qr-code {
	padding: 15px;
	background: dark-gray;
	border-radius: 8px;
	width: 250px;
	height: 250px;
}

.control {
	margin: 0;
}

.btn > svg {
	margin: 0;
}
</style>