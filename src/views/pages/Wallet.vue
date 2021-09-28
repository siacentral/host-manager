<template>
	<div class="page page-wallet">
		<div class="receive-qr-code">
			<AddressQRCode class="qr-code" :address="address" />
		</div>
		<div class="control">
			<input type="text" class="receive-address" :value="address" readonly />
		</div>
		<button class="btn btn-inline" @click="onCopyAddress"><icon icon="copy" /></button>
		<div class="send-wrapper">
			<button class="btn btn-inline" @click="modal = 'send' "><icon icon="copy" /> Send Siacoins</button>
		</div>
		<send-modal v-if="modal === 'send'" @close="modal = null" />
	</div>
</template>

<script>
import log from 'electron-log';
import { mapState, mapActions } from 'vuex';
import { clipboard } from 'electron';

import AddressQRCode from '@/components/wallet/AddressQRCode';
import SendModal from '@/components/wallet/SendModal';

export default {
	components: {
		AddressQRCode,
		SendModal
	},
	computed: {
		...mapState({
			address: state => state.hostWallet.lastAddress
		})
	},
	data() {
		return {
			modal: null
		};
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

.receive-qr-code, .buy-button, .send-wrapper {
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