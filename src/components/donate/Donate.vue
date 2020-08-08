<template>
	<div class="donate-content">
		<transition name="fade" mode="out-in" appear>
			<div class="add-fee" v-if="!paid" key="add">
				<currency-input v-model="feeAmount" />
				<div class="control">
					<input type="checkbox" id="chkFeeRecurring" v-model="recurring" />
					<label for="chkFeeRecurring">Recurring</label>
				</div>
				<div class="control" v-if="feeAmount.gt(0)">
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
				<p v-if="recurring">Your first donation of <span v-html="formatSiacoinString(feeAmount)" /> will occur at block {{ formatNumber(payoutHeight+4320) }} then again every {{ formatNumber(4320) }} blocks. You may cancel your donation from this dialog at any time.</p>
			</div>
		</transition>
		<div class="text-center sponsor-link">
			<a href="https://github.com/sponsors/siacentral">Sponsor Sia Central on GitHub</a>
		</div>
		<div class="fees-list" v-if="fees.length !== 0">
			<h4>Recurring Donations</h4>
			<table class="pending-fees">
				<thead>
					<tr>
						<td>Amount</td>
						<td>Payment Height</td>
						<td></td>
					</tr>
				</thead>
				<tbody>
					<tr v-for="fee in fees" :key="fee.feeuid">
						<td>
							<div v-html="formatSiacoinString(fee.amount)" />
							<div v-html="formatCurrencyString(fee.amount)" />
						</td>
						<td>{{ formatNumber(fee.payoutheight) }}</td>
						<td><button class="btn btn-inline" @click="onCancelFee(fee.feeuid)">Cancel</button></td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</template>

<script>
import CurrencyInput from '@/components/CurrencyInput';

import { mapState } from 'vuex';
import BigNumber from 'bignumber.js';
import SiaApiClient from '@/api/sia';
import { formatPriceString, formatNumber } from '@/utils/format';
import { HOST_MANAGER_APP_ID, HOST_MANAGER_ADDRESS } from '@/consts';

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
			if (this.recurring)
				return `I would like to donate ${this.formatSiacoinString(this.feeAmount)} starting at block ${formatNumber(this.payoutHeight + 4320)} and recurring every month`;

			return `I would like to donate to Sia Central, ${this.formatSiacoinString(this.feeAmount)} will be deducted from my wallet and sent to Sia Central.`;
		}
	},
	data() {
		return {
			fees: [],
			payoutHeight: 0,
			feeAmount: new BigNumber(0),
			recurring: false,
			confirmed: false,
			paid: false
		};
	},
	beforeMount() {
		this.onLoadFees();
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
		async onLoadFees() {
			try {
				const client = new SiaApiClient(this.config),
					pending = await client.getPendingFees(HOST_MANAGER_APP_ID),
					payoutHeight = await client.feeManagerPayoutHeight();

				this.fees = pending;
				this.payoutHeight = payoutHeight;
			} catch (ex) {
				console.error('FeeModal.beforeMount', ex);
			}
		},
		async sendDonation() {
			const client = new SiaApiClient(this.config);

			await client.sendSiacoins(this.feeAmount.toString(10), HOST_MANAGER_ADDRESS, true);
		},
		async addFee() {
			const client = new SiaApiClient(this.config);

			await client.addFee(this.feeAmount.toString(10), HOST_MANAGER_ADDRESS, HOST_MANAGER_APP_ID, this.recurring);
			await this.onLoadFees();
		},
		async onDonate() {
			try {
				if (this.recurring)
					await this.addFee();
				else
					await this.sendDonation();

				await this.onLoadFees();

				this.$emit('donated');
				this.paid = true;
			} catch (ex) {
				console.error('FeeModal.onDonate', ex);
			}
		},
		async onCancelFee(feeID) {
			try {
				const client = new SiaApiClient(this.config);

				await client.cancelFee(feeID);
				await this.onLoadFees();
			} catch (ex) {
				console.error('FeeModal.onCancelFee', ex);
			}
		}
	},
	watch: {
		feeAmount() {
			this.confirmed = false;
		},
		recurring() {
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