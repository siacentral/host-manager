<template>
	<transition name="qr-fade" mode="out-in" appear>
		<div class="code-wrapper" v-html="qrCode"/>
	</transition>
</template>

<script>
import QRCode from '@/utils/qrcode';

export default {
	props: {
		address: String
	},
	data() {
		return {
			qrCode: null
		};
	},
	beforeMount() {
		this.generateQRCode();
	},
	methods: {
		generateQRCode() {
			if (!this.address)
				return;

			const code = new QRCode(7, 'Q');

			code.addData(this.address, 'Byte');
			code.make();

			this.qrCode = code.createSvgTag();
		}
	},
	watch: {
		address() {
			this.generateQRCode();
		}
	}
};
</script>

<style lang="stylus" scoped>
.code-wrapper {
	display: inline-block;

	/* deep-scope selector for v-html renderer */
	>>> svg {
		margin: auto;
		width: 100%;
		height: 100%;
	}
}

.qr-fade-enter-active {
	transition: transform .5s ease, opacity .5s ease;
}

.qr-fade-leave-active {
	transition: transform .5s ease, opacity .5s ease;
}

.qr-fade-enter, .qr-fade-leave-to {
	opacity: 0;
}
</style>