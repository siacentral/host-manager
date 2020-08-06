<template>
	<div class="data-chart">
		<div class="chart-title">{{ title }}</div>
		<div class="chart-selected">{{ selectedLabel }}</div>
		<div class="chart-sub">
			<slot />
		</div>
		<div class="chart">
			<stacked-chart class="chart-inner" :nodes="nodes" :colors="colors" :fills="fills" @selected="onSetSelected" />
		</div>
		<div class="chart-labels">
			<div class="chart-label-left">{{ labels[0] }}</div>
			<div class="chart-label-right">{{ labels[labels.length - 1] }}</div>
		</div>
	</div>
</template>

<script>
import StackedChart from '@/components/charts/StackedChart';

export default {
	components: {
		StackedChart
	},
	props: {
		title: String,
		nodes: Array,
		colors: Array,
		fills: Array,
		labels: Array
	},
	data() {
		return {
			active: -1
		};
	},
	computed: {
		selectedLabel() {
			if (this.active === -1 || !this.labels[this.active])
				return `${this.labels[this.labels.length - 4]}`;

			return this.labels[this.active];
		}
	},
	methods: {
		onSetSelected(i) {
			try {
				this.active = i;
				this.$emit('selected', i);
			} catch (ex) {
				console.error('ChartDisplay.onSetSelected', ex);
			}
		}
	}
};
</script>

<style lang="stylus" scoped>
.data-chart {
	position: relative;
	display: grid;
	grid-template-columns: repeat(2, min-content);
	grid-template-rows: auto auto 1fr auto;
	justify-content: space-between;
	background: bg-dark-accent;
	border-radius: 8px;
	overflow: hidden;
	box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);

	.chart-title, .chart-selected {
		font-size: 1rem;
		color: rgba(255, 255, 255, 0.84);
		white-space: nowrap;
		padding: 10px 15px 15px;
	}

	.chart-sub {
		font-size: 1.2rem;
		color: primary;
		padding: 5px 15px;
	}

	.chart {
		position: relative;
		vertical-align: top;
		margin-bottom: -1px;

		.chart-inner {
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			width: 100%;
			height: 100%;
		}
	}

	.chart, .chart-sub, .chart-controls, .chart-labels {
		grid-column: 1 / -1;
	}

	.chart-labels {
		display: grid;
		grid-template-columns: repeat(2, auto);
		justify-content: space-between;
		align-content: center;
		color: rgba(255, 255, 255, 0.84);
		font-size: 0.8rem;
		padding: 0 15px 10px;
		background: #227051;
	}

	.chart-data-controls {
		grid-column: 1 / -1;

		button {
			display: inline-block;
			padding: 4px 8px;
			background: none;
			color: rgba(255, 255, 255, 0.54);
			border: 1px solid #999;
			border-radius: 4px;
			outline: none;
			margin-right: 8px;
			font-size: 0.8rem;
			cursor: pointer;
			transition: all 0.3s linear;

			&.chart-selected {
				color: primary;
				border-color: primary;
			}
		}
	}
}
</style>