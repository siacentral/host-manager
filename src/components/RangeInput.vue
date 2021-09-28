<template>
	<input type="range" ref="element" @input="onChange" v-model="current" :min="min" :max="max" :step="step" :readonly="readonly" />
</template>

<script>
export default {
	props: {
		value: Number,
		min: Number,
		max: Number,
		step: Number,
		readonly: Number
	},
	data() {
		return {
			current: this.value
		};
	},
	mounted() {
		this.onChange();
	},
	methods: {
		onChange() {
			if (this.$refs.element)
				this.$refs.element.style.backgroundSize = (this.current - this.min) * 100 / (this.max - this.min) + '% 100%';

			if (this.value !== this.current)
				this.$emit('input', parseFloat(this.current));
		}
	},
	watch: {
		value(newval) {
			this.current = newval;
			this.onChange();
		}
	}
};
</script>

<style lang="stylus" scoped>
	input[type="range"] {
		-webkit-appearance: none;
		width: 100%;
		height: 7px;
		margin-left: 0;
		margin-right: 0;
		padding: 0;
		background: dark-gray;
		border-radius: 5px;
		background-image: linear-gradient(primary, primary);
		background-size: 70% 100%;
		background-repeat: no-repeat;

		&::-webkit-slider-thumb {
			-webkit-appearance: none;
			border: 1px solid primary;
			height: 12px;
			width: 12px;
			border-radius: 12px;
			background: primary;
			cursor: ew-resize;
			box-shadow: 0 0 2px 0 #555;
			transition: background .3s ease-in-out;
		}

		&:focus {
			outline: none;
		}

		&::-webkit-slider-runnable-track  {
			-webkit-appearance: none;
			border: none;
			background: transparent;
		}
	}
</style>
