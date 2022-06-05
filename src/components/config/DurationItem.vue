<template>
	<div class="config-item">
		<div class="config-title">
			<slot name="title" />
		</div>
		<div class="config-values">
			<div class="control">
				<input type="text" v-model="durationStr" @blur="onFormatDuration" @input="onChange" />
			</div>
			<div class="avg-value" v-if="average && average > 0">
				<div class="avg-title">Average</div>
				<div class="values" v-html="averageDisplay" />
			</div>
		</div>
		<div class="config-denom"><slot name="denomination" /></div>
		<p class="config-description"><slot name="description" /></p>
	</div>
</template>

<script>
import { formatBlockTimeString } from '@/utils/format';
import { parseBlockTimeString } from '@/utils/parse';

export default {
	props: {
		value: Number,
		average: Number
	},
	emits: ['update'],
	beforeMount() {
		this.duration = this.value;
		this.onFormatDuration();
	},
	data() {
		return {
			duration: 0,
			durationStr: '1 w'
		};
	},
	computed: {
		averageDisplay() {
			if (!this.average)
				return '';

			const { value, label } = formatBlockTimeString(this.average);

			return `${value} <span class="currency-display">${label}</span>`;
		}
	},
	methods: {
		onChange() {
			try {
				console.log('pre change', this.durationStr);
				this.duration = parseBlockTimeString(this.durationStr);
				console.log('change', this.duration, this.durationStr);
				this.$emit('update', this.duration);
			} catch (ex) {
				console.error('DurationItem.onChange', ex);
			}
		},
		onFormatDuration() {
			try {
				const { value, label } = formatBlockTimeString(this.duration);

				this.durationStr = `${value} ${label}`;
			} catch (ex) {
				console.error('DurationItem.onFormatDuration', ex);
			}
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

	.control input {
		text-align: right;
	}

	.config-values {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		grid-gap: 5px;
		align-items: center;

		.control {
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