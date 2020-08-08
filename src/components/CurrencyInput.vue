<template>
	<div class="currency-control">
		<input ref="txtSiacoin" type="text" value="0.00" @input="onChangeSiacoin" @blur="onFormatValues" />
		<label>SC</label>
		<input ref="txtCurrency" type="text" value="$0.00" @input="onChangeCurrency" @blur="onFormatValues" />
		<label>{{ currency }}</label>
	</div>
</template>

<script>
import { mapState } from 'vuex';
import BigNumber from 'bignumber.js';
import { formatPriceString } from '@/utils/format';
import { parseSiacoinString, parseCurrencyString } from '@/utils/parse';

export default {
	props: {
		value: Object
	},
	computed: {
		...mapState({
			currency: state => state.config.currency,
			coinPrice: state => state.coinPrice
		})
	},
	data() {
		return {
			amount: new BigNumber(0)
		};
	},
	mounted() {
		this.amount = this.value;
		this.onFormatValues();
	},
	methods: {
		formatCurrencyString(value) {
			return formatPriceString(value, 2, this.currency, this.coinPrice[this.currency]).value;
		},
		onChangeSiacoin() {
			try {
				const value = this.$refs.txtSiacoin.value;

				this.amount = parseSiacoinString(value);
				this.$refs.txtCurrency.value = this.formatCurrencyString(this.amount);
				this.$emit('input', this.amount);
			} catch (ex) {
				console.error('CurrencyInput.onChangeSiacoin', ex);
			}
		},
		onChangeCurrency() {
			try {
				const value = this.$refs.txtCurrency.value,
					parsed = parseCurrencyString(value, this.coinPrice[this.currency]),
					siacoins = formatPriceString(parsed, 2, 'sc', 1);

				console.log(value, this.currency, parsed);

				this.amount = parsed;
				this.$refs.txtSiacoin.value = siacoins.value;
				this.$emit('input', this.amount);
			} catch (ex) {
				console.error('CurrencyInput.onChangeCurrency', ex);
			}
		},
		onFormatValues() {
			try {
				const siacoins = formatPriceString(this.amount, 2);

				this.$refs.txtCurrency.value = this.formatCurrencyString(this.amount);
				this.$refs.txtSiacoin.value = siacoins.value;
			} catch (ex) {
				console.error('CurrencyInput.onFormatValues');
			}
		}
	}
};
</script>

<style lang="stylus" scoped>
.currency-control {
	display: grid;
	grid-template-columns: minmax(0, 1fr) auto;
	margin-bottom: 15px;

	input, label {
		height: 36px;
		line-height: 36px;
		padding: 0 5px;
	}

	label {
		display: inline-block;
		color: rgba(255, 255, 255, 0.54);
		text-transform: uppercase;
		margin: 0;
	}

	input {
		display: block;
		width: 100%;
		font-size: 1.2rem;
		background: transparent;
		border: 1px solid dark-gray;
		color: rgba(255, 255, 255, 0.84);
		outline: none;
		text-align: right;

		&:first-of-type {
			border-top-left-radius: 4px;
			border-top-right-radius: 4px;
		}

		&:last-of-type {
			border-bottom-left-radius: 4px;
			border-bottom-right-radius: 4px;
			border-top: none;
		}
	}
}
</style>