<template>
	<modal title="" modalStyle="small" @close="onClose">
		<div class="content">
			<transition name="fade" mode="out-in" appear>
				<div class="add-fee" v-if="!sent" key="send">
					<div class="control">
						<label class="label">Recipient</label>
						<input class="input" type="text" v-model="recipient" placeholder="Recipient Address" />
					</div>
					<div class="control">
						<label v-html="availableBalanceText" />
					</div>
					<div class="control text-right">
						<input type="checkbox" id="chkUsePct" v-model="usePct" />
						<label for="chkUsePct">Send Percentage</label>
					</div>
					<div class="percentage-split" v-if="usePct">
						<range-input :min="0" :max="1" :step="0.1" v-model="sendPct" />
						<div class="percent-usage">{{ `${sendPct * 100}%` }}</div>
					</div>
					<currency-input v-model="amount" :refresh="n" :readonly="usePct" />
					<div class="control text-right">
						<input type="checkbox" id="chkIncludeFee" v-model="includeFees" />
						<label for="chkIncludeFee">Include Fee</label>
					</div>
					<div class="control">
						<label v-html="feeEstimateText" />
					</div>
					<div class="control">
						<label v-html="recipientReceivesText" />
					</div>
					<div class="control">
						<label :class="remainderClasses" v-html="remainingBalanceText" />
					</div>
					<div class="control" v-if="amount.gt(0) && recipient.length !== 0">
						<input type="checkbox" id="chkConfirm" v-model="confirmed" />
						<label for="chkConfirm" v-html="confirmText" class="text-warning" />
					</div>
					<p class="text-error" v-if="error">Unable to send transaction: {{ error }}.</p>
					<div class="text-center">
						<button class="btn btn-inline btn-success" @click="onSend" :disabled="!confirmed || sending || !loaded">Send</button>
					</div>
				</div>
				<div class="fee-success" v-else-if="sent && !broadcast" key="sending">
					<h2 class="text-center text-success">Broadcasting Transaction...</h2>
					<p>Your transaction is being broadcast to the network...</p>
					<div class="control">
						<label v-html="feeEstimateText" />
					</div>
					<div class="control">
						<label v-html="recipientReceivesText" />
					</div>
					<div class="control">
						<label :class="remainderClasses" v-html="remainingBalanceText" />
					</div>
				</div>
				<div class="fee-success" v-else key="success">
					<h2 class="text-center text-success">Transaction Sent!</h2>
					<p>Your transaction is on its way. It can take between 10 minutes to an hour for confirmation on the blockchain. <a :href="siastatsLink" target="_blank">View on SiaStats</a></p>
					<div class="control">
						<label v-html="feeEstimateText" />
					</div>
					<div class="control">
						<label v-html="recipientReceivesText" />
					</div>
					<div class="control">
						<label :class="remainderClasses" v-html="remainingBalanceText" />
					</div>
				</div>
			</transition>
		</div>
	</modal>
</template>

<script>
import Modal from '@/components/Modal';
import CurrencyInput from '@/components/CurrencyInput';
import RangeInput from '@/components/RangeInput';

import { mapState } from 'vuex';
import BigNumber from 'bignumber.js';
import SiaApiClient from '@/api/sia';
import { formatPriceString, formatNumber } from '@/utils/format';

export default {
	components: {
		CurrencyInput,
		Modal,
		RangeInput
	},
	computed: {
		...mapState({
			config: state => state.config,
			currency: state => state.config.currency,
			coinPrice: state => state.coinPrice
		}),
		confirmText() {
			return `I would like to send ${this.formatSiacoinString(this.amount)} ${this.includeFees ? '-' : '+'} ${this.formatSiacoinString(this.feeEstimate)} to the recipient. The amount will be deducted from my wallet and sent to the recipient. This action cannot be reversed.`;
		},
		availableBalanceText() {
			if (!this.loaded) return 'Available Balance: loading...';

			const format = formatPriceString(this.spendableBalance, 4, 'sc', 1);

			return `Available Balance: ${format.value} <span class="currency-display">${format.label}</span>`;
		},
		recipientReceivesText() {
			if (!this.loaded) return 'Recipient Receives: loading...';

			let received = this.amount;
			if (received.gt(0) && this.includeFees)
				received = received.minus(this.feeEstimate);

			const format = formatPriceString(received, 4, 'sc', 1);
			return `Recipient Receives: ${format.value} <span class="currency-display">${format.label}</span> ${this.includeFees ? '(may vary based on final transaction fee)' : ''}`;
		},
		remainingBalanceText() {
			if (!this.loaded) return 'Remaining Balance: loading...';

			let remainder = this.spendableBalance.minus(this.amount);
			if (this.amount.gt(0) && !this.includeFees)
				remainder = remainder.minus(this.feeEstimate);

			const format = formatPriceString(remainder, 4, 'sc', 1);
			return `Remaining Balance: ${format.value} <span class="currency-display">${format.label}</span> ${!this.includeFees ? '(may vary based on final transaction fee)' : ''}`;
		},
		feeEstimateText() {
			if (!this.loaded) return 'Estimated Fee: loading...';

			let fee = this.feeEstimate;
			if (this.amount.lte(0))
				fee = new BigNumber(0);

			const format = formatPriceString(fee, 4, 'sc', 1);

			return `Estimated Fee: ${format.value} <span class="currency-display">${format.label}</span>`;
		},
		remainderClasses() {
			if (!this.loaded) return '';

			let remainder = this.spendableBalance.minus(this.amount);
			if (!this.includeFees)
				remainder = remainder.minus(this.feeEstimate);

			if (remainder.lt(0))
				return 'text-error';

			return '';
		},
		siastatsLink() {
			return `https://siastats.info/navigator?search=${this.transactionID}`;
		}
	},
	data() {
		return {
			n: 0,
			usePct: false,
			sendPct: 0,
			apiClient: null,
			error: null,
			recipient: '',
			outputs: [],
			transactionID: null,
			spendableBalance: new BigNumber(0),
			maxFee: new BigNumber(0),
			includeFees: false,
			feeEstimate: new BigNumber(0),
			amount: new BigNumber(0),
			loaded: false,
			confirmed: false,
			sending: false,
			sent: false,
			broadcast: false
		};
	},
	async beforeMount() {
		try {
			this.apiClient = new SiaApiClient(this.config);

			const { maximum } = await this.apiClient.getTPoolFees(),
				{ siacoins } = await this.apiClient.getUnspentOutputs();

			this.maxFee = new BigNumber(maximum);
			this.outputs = siacoins.map(o => {
				this.spendableBalance = this.spendableBalance.plus(o.value);
				return {
					id: o.id,
					unlockHash: o.unlockhash,
					value: new BigNumber(o.value)
				};
			}).sort((a, b) => a.value.gt(b.value) ? -1 : a.value.lt(b.value) ? 1 : 0);
			this.calcFeeEstimate();
			this.loaded = true;
		} catch (ex) {
			this.pushNotification({
				message: ex.message,
				severity: 'danger'
			});
			console.error('SendModal.beforeMount', ex);
		}
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
		calcFeeEstimate() {
			let requiredSiacoinOutputs = 0,
				totalSiacoinInput = new BigNumber(0);

			for (let i = 0; i < this.outputs.length; i++) {
				if (totalSiacoinInput.gte(this.amount))
					break;

				totalSiacoinInput = totalSiacoinInput.plus(this.outputs[i].value);
				requiredSiacoinOutputs++;
			}

			this.feeEstimate = new BigNumber(200).plus(313 * requiredSiacoinOutputs).times(this.maxFee);
		},
		async onSend() {
			try {
				if (!this.confirmed)
					return;

				this.sending = true;
				const { transactionids } = await this.apiClient.sendSiacoins(this.amount.toString(10), this.recipient, this.includeFees);
				this.transactionID = transactionids[transactionids.length - 1];
				this.sent = true;
				setTimeout(() => (this.broadcast = true), 15000);
			} catch (ex) {
				this.error = ex.message;
				console.error('SendModal.onDonate', ex);
			} finally {
				this.sending = false;
			}
		},
		onClose() {
			try {
				if (this.sending || (this.sent && !this.broadcast))
					return;

				this.$emit('close');
			} catch (ex) {
				this.pushNotification({
					message: ex.message,
					severity: 'danger'
				});
				console.error('SendModal.onClose', ex);
			}
		},
		calcSendPct(pct = 1) {
			try {
				if (!this.loaded || this.sending || this.sent) return;

				this.amount = this.spendableBalance.times(pct).dp(0, BigNumber.ROUND_DOWN);
				this.includeFees = true;
				this.n++;
			} catch (ex) {
				this.pushNotification({
					message: ex.message,
					severity: 'danger'
				});
				console.error('SendModal.onClickMax', ex);
			}
		}
	},
	watch: {
		amount() {
			this.calcFeeEstimate();
			this.confirmed = false;
		},
		includeFees() {
			this.calcFeeEstimate();
			this.confirmed = false;
		},
		recipient() {
			this.calcFeeEstimate();
			this.confirmed = false;
		},
		sendPct() {
			this.calcSendPct(this.sendPct);
			this.calcFeeEstimate();
			this.confirmed = false;
		}
	}
};
</script>

<style lang="stylus" scoped>
.text-right.text-right {
	text-align: right !important;
}

.percentage-split {
	display: grid;
	margin-bottom: 15px;
	grid-template-columns: minmax(0, 1fr) auto;
	grid-gap: 15px;
	align-items: center;

	.percent-usage {
		width: auto;
		text-align: center;
		background: transparent;
		border: 1px solid dark-gray;
		padding: 5px;
		border-radius: 4px;
		color: rgba(255, 255, 255, 0.54);
	}
}

.btn.btn-small {
	font-size: 0.8rem;
}

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