<template>
	<div class="config-item">
		<div class="config-title">
			{{ title }}
			<div class="control control-inline" v-if="pinVisible">
				<input type="checkbox" :id="checkboxID" v-model="pinPrice" />
				<label :for="checkboxID">Pin to {{ config.currency.toUpperCase() }}</label>
			</div>
		</div>
		<div class="config-error" v-if="error">{{ error }}</div>
		<div class="new-value">
			<div class="control">
				<input type="text" ref="input" @input="onChangeValue">
				<label class="sub-label" v-if="sublabel">{{ sublabel }}</label>
			</div>
		</div>
		<div class="prev-value">
			<div class="value-text" v-if="avgValue">
				{{ avgValue }}
			</div>
			<div class="sub-label" v-if="sublabel">{{ sublabel }}</div>
		</div>
		<div class="config-description">{{ description }}</div>
	</div>
</template>

<script>
import { mapState } from 'vuex';

export default {
	props: {
		title: String,
		configKey: String,
		sublabel: String,
		error: String,
		value: String,
		description: String,
		avgValue: String,
		showPin: Boolean,
		pinned: Boolean
	},
	data() {
		return {
			pinPrice: false
		};
	},
	computed: {
		...mapState(['config']),
		checkboxID() {
			return `chk-lock-price-${this._uid}`;
		},
		pinVisible() {
			return this.showPin && this.config &&
				this.config.currency && this.config.currency.toLowerCase() !== 'siacoin';
		}
	},
	mounted() {
		this.$refs.input.value = this.value;
		this.pinPrice = this.pinned;
	},
	methods: {
		onChangeValue() {
			this.$emit('change', {
				key: this.configKey,
				value: this.$refs.input.value,
				pinned: this.showPin && this.pinPrice
			});
		}
	},
	watch: {
		value(val) {
			if (this.$refs.input.value !== val)
				this.$refs.input.value = val;
		},
		pinPrice() {
			this.onChangeValue();
		},
		pinned(val, old) {
			if (val === old || val === this.pinPrice)
				return;

			this.pinPrice = val;
			this.onChangeValue();
		}
	}
};
</script>

<style lang="stylus" scoped>
.config-item {
	display: grid;
	grid-template-columns: 2fr 1fr;
	grid-gap: 15px;
	background: #191919;
	border-radius: 8px;
	margin-bottom: 15px;
	padding: 15px 0;

	.config-title, .config-description {
		padding: 0 15px;
		grid-area: auto / 1 / auto / span 2;

		.control {
			float: right;
		}
	}

	.control {
		margin: 0;

		input, select, textarea {
			text-align: right;
		}
	}

	.config-error {
		grid-area: auto / 1 / auto/ span 2;
		padding: 0 15px;
		color: red;
	}

	.new-value, .prev-value {
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100%;
		text-align: right;
		padding: 0 15px;
		min-height: 62px;
		font-size: 1.2rem;
		align-items: right;
		justify-content: center;

		.sub-label.sub-label {
			margin: 5px 0 0;
			font-size: 0.9rem;
			color: rgba(255, 255, 255, 0.54);
		}
	}

	.prev-value {
		background: dark-gray;
		border-top-left-radius: 8px;
		border-bottom-left-radius: 8px;
	}

	.config-title {
		font-size: 1.2rem;
		color: rgba(255, 255, 255, 0.54);
	}
}
</style>
