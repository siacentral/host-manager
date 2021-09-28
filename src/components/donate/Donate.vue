<template>
	<div class="donate-content">
		<transition name="fade" mode="out-in" appear>
			<div class="fee-error" v-if="error" key="error">
				<h2 class="text-center text-error">Error Processing Donation</h2>
				<p>There was a problem processing your donation: {{ error }}.</p>
			</div>
			<div class="add-fee" v-else-if="!paid" key="add">
				<p>Sia Central currently relies on donations to fund development and server costs. If you enjoy our apps and services consider contributing a small amount of Siacoin either once or on a monthly basis.</p>
				<currency-input v-model="donateAmount" />
				<div class="control" v-if="donateAmount.gt(0)">
					<input type="checkbox" id="chkConfirm" v-model="confirmed" />
					<label for="chkConfirm" v-html="confirmText" />
				</div>
				<div class="text-center">
					<button class="btn btn-inline btn-success" @click="onDonate" :disabled="!confirmed">Donate</button>
				</div>
			</div>
			<div class="fee-success" v-else key="success">
				<h2 class="text-center text-success">Thank You!</h2>
				<p>Sia Central appreciates your donation. We hope you continue to enjoy our apps and services!</p>
			</div>
		</transition>
		<div class="text-center sponsor-link">
			<a href="https://github.com/sponsors/siacentral">Sponsor Sia Central on GitHub</a>
		</div>
	</div>
</template>

<script>
import CurrencyInput from '@/components/CurrencyInput';

import { mapState } from 'vuex';
import BigNumber from 'bignumber.js';
import SiaApiClient from '@/api/sia';
import { formatPriceString, formatNumber } from '@/utils/format';
import { HOST_MANAGER_ADDRESS } from '@/consts';

export default {
	components: {
		CurrencyInput
	},
	computed: {
		...mapState({
			config: state => state.config,
			currency: state => state.config.currency,
			coinPrice: state => state.coinPrice
		}),
		confirmText() {
			return `I would like to donate to Sia Central, ${this.formatSiacoinString(this.donateAmount)} will be deducted from my wallet and sent to Sia Central.`;
		}
	},
	data() {
		return {
			error: null,
			donateAmount: new BigNumber(0),
			confirmed: false,
			paid: false
		};
	},
	methods: {
		formatNumber,
		formatSiacoinString(value) {
			const format = formatPriceString(new BigNumber(value), 2, 'sc', 1);

			return `${format.value} <span class="currency-display">${format.label}</span>`;
		},
		formatCurrencyString(value) {
			const format = formatPriceString(new BigNumber(value), 2, this.currency, this.coinPrice[this.currency]);

			return `${format.value} <span class="currency-display">${format.label}</span>`;
		},
		async sendDonation() {
			const client = new SiaApiClient(this.config);

			await client.sendSiacoins(this.donateAmount.toString(10), HOST_MANAGER_ADDRESS, true);
		},
		async onDonate() {
			try {
				if (!this.confirmed)
					return;

				await this.sendDonation();

				this.$emit('donated');
				this.paid = true;
			} catch (ex) {
				this.error = ex.message;
				console.error('FeeModal.onDonate', ex);
			}
		}
	},
	watch: {
		donateAmount() {
			this.confirmed = false;
		}
	}
};
</script>

<style lang="stylus" scoped>
a {
	color: rgba(255, 255, 255, 0.54);
	text-decoration: none;

	&:hover, &:active, &:focus {
		color: primary;
	}
}

.control {
	margin-bottom: 15px;
}

.buttons .btn {
	margin: 0;
}

.fees-list {
	margin-top: 15px;
}

.sponsor-link {
	margin-top: 15px;
}
</style>