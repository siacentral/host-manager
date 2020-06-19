<template>
	<modal title="Receive Siacoin" modalStyle="small" @close="$emit('close')">
		<div class="receive-modal">
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
	</modal>
</template>

<script>
import log from 'electron-log';
import { mapState, mapActions } from 'vuex';
import { clipboard } from 'electron';
import Transak from '@transak/transak-sdk';

import AddressQRCode from '@/components/wallet/AddressQRCode';
import Modal from '@/components/Modal';

export default {
	components: {
		Modal,
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
.receive-modal {
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
