<template>
	<div class="config-item">
		<div class="config-title">
			<slot name="title" />
		</div>
		<div class="config-values">
			<div class="control">
				<input type="text" v-model="sizeStr" @blur="onFormatSize" @input="onChange" />
			</div>
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
import { mapState } from 'vuex';
import { formatByteString } from '@/utils/format';
import { parseByteString } from '@/utils/parse';

export default {
	props: {
		value: Object,
		average: Object
	},
	emits: ['update'],
	beforeMount() {
		this.size = this.value;
		this.onFormatSize();
	},
	computed: {
		...mapState({
			dataUnit: state => state.config.data_unit
		}),
		averageDisplay() {
			if (!this.average)
				return '';

			const { value, label } = formatByteString(this.average);

			return `${value} <span class="currency-display">${label}</span>`;
		}
	},
	data() {
		return {
			size: 0,
			sizeStr: '0 B'
		};
	},
	methods: {
		onChange() {
			try {
				this.size = parseByteString(this.sizeStr);

				this.$emit('update', this.size);
			} catch (ex) {
				console.error('SizeItem.onChange', ex);
			}
		},
		onFormatSize() {
			try {
				const { value, label } = formatByteString(this.size, this.dataUnit, 2);

				this.sizeStr = `${value} ${label.toUpperCase()}`;
			} catch (ex) {
				console.error('SizeItem.onFormatSize', ex);
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

	.control {
		margin: 0;

		input {
			text-align: right;
		}
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