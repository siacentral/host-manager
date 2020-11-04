<template>
	<div class="config-item">
		<div class="config-title">
			<slot name="title" />
			<div class="control control-inline">
				<input type="checkbox" :id="checkboxID" v-model="pricePinned" @change="onUpdate" />
				<label :for="checkboxID">Pin to {{ currency.toUpperCase() }}</label>
			</div>
		</div>
		<div class="config-values">
			<currency-input v-model="price" @update="onCurrencyUpdate" />
			<div class="avg-value" v-if="average && average.gt(0)">
				<div class="avg-title">Average</div>
				<div class="values" v-html="averageDisplay" />
			</div>
		</div>
		<div class="config-denom"><slot name="denomination" /></div>
		<p class="config-description"><slot name="description" /></p>
	</div>
</template>

<script>
import BigNumber from 'bignumber.js';
import { mapState } from 'vuex';
import { formatPriceString } from '@/utils/format';

import CurrencyInput from '@/components/CurrencyInput';

export default {
	components: {
		CurrencyInput
	},
	computed: {
		...mapState({
			currency: state => state.config.currency || 'usd',
			coinPrice: state => state.coinPrice
		}),
		checkboxID() {
			return `chk-pin-price-${this._uid}`;
		},
		averageDisplay() {
			if (!this.average)
				return '';

			const sc = formatPriceString(this.average, 2, 'sc', 1),
				disp = formatPriceString(this.average, 2, this.currency, this.coinPrice[this.currency]);

			return `<div>${sc.value} <span class="currency-display">${sc.label}</span></div><div>${disp.value} <span class="currency-display">${disp.label}</span></div>`;
		}
	},
	props: {
		value: Object,
		average: Object,
		pinned: Boolean
	},
	beforeMount() {
		this.price = this.value;
		this.pricePinned = this.pinned;
	},
	data() {
		return {
			pricePinned: false,
			price: new BigNumber(0),
			fiatPrice: '$0.00'
		};
	},
	methods: {
		onCurrencyUpdate({ amount, fiat }) {
			this.price = amount;
			this.fiatPrice = fiat;

			this.onUpdate();
		},
		onUpdate() {
			this.$emit('change', {
				value: this.price,
				fiat: this.fiatPrice,
				pinned: this.pricePinned
			});
		}
	}
};
</script>

<style lang="stylus" scoped>
.config-item {
	background: #191919;
	border-radius: 8px;
	margin-bottom: 15px;
	padding: 15px;

	.config-title {
		display: grid;
		color: rgba(255, 255, 255, 0.54);
		grid-template-columns: repeat(2, auto);
		justify-content: space-between
		align-content: center;
		margin-bottom: 15px;

		.control {
			margin: 0;
			padding: 0;
		}
	}

	.config-description {
		color: rgba(255, 255, 255, 0.54);
		font-size: 0.9rem;
	}

	.config-denom {
		text-align: right;
		color: rgba(255, 255, 255, 0.54);
	}

	.config-values {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		grid-gap: 5px;
		align-items: center;

		.currency-control {
			margin: 0;
		}

		.avg-title {
			margin-bottom: 5px;
			text-align: center;
			font-size: 0.8rem;
			color: rgba(255, 255, 255, 0.54);
		}

		.avg-value {
			background: bg-dark-accent;
			padding: 8px;
			border-radius: 8px;
			text-align: center;

			.values div {
				margin-bottom: 5px;
			}
		}
	}
}
</style>