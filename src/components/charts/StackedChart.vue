<template>
	<svg :viewBox="`0 0 ${width} ${height}`" @resize="onResize">
		<template v-for="(group, i) in coordinates">
			<path :key="`line-fill-${i}`" class="line" :fill="fills[i]" :stroke="colors[i]" :d="fillPaths[i]" stroke-width="2" />
			<!--<path :key="`line-${i}`" class="line" :stroke="colors[i]" :d="lines[i]" fill="none" stroke-width="4" />-->
			<circle
				class="point-bg" v-for="(point, j) in group"
				:key="`bg-${i}-${j}`"
				:cx="point[0]"
				:cy="point[1]"
				r="4" />
			<circle
				class="point" v-for="(point, j) in group"
				:key="`point-${i}-${j}`"
				:cx="point[0]"
				:cy="point[1]"
				:fill="colors[i]"
				:data-num="j"
				r="2" />
		</template>
		<rect
			v-for="i in len"
			:width="`${nodeWidth}px`"
			:x="`${nodeWidth * (i - 1)}px`"
			:height="`${height}px`"
			:key="i - 1"
			fill="transparent"
			@mouseover="$emit('selected', i - 1)"
			@mouseout="$emit('selected', -1)"/>
	</svg>
</template>

<script>
import BigNumber from 'bignumber.js';
import { line, curveCardinal } from 'd3-shape';

export default {
	props: {
		nodes: Array,
		colors: Array,
		fills: Array
	},
	computed: {
		maxY() {
			return this.stacked
				.reduce((m, sa) => sa.reduce((v, i) => v.gt(i) ? v : i, m), new BigNumber(1));
		},
		minY() {
			return this.stacked
				.reduce((m, sa) => sa.reduce((v, i) => v && v.lt(i) ? v : i, m), null);
		},
		nodeWidth() {
			return this.width / this.len;
		},
		len() {
			if (!Array.isArray(this.nodes) || this.nodes.length === 0 || this.nodes[0].length === 0)
				return 12;

			return this.nodes[0].length;
		},
		stacked() {
			if (!Array.isArray(this.nodes) || this.nodes.length === 0 || this.nodes[0].length === 0)
				return [[new Array(12)].fill(new BigNumber(Math.floor(Math.random() * 50) + 1))];

			return this.nodes.map((ps, i) => ps.map((v, j) => {
				for (let k = i - 1; k >= 0; k--)
					v = v.plus(this.nodes[k][j]);

				return v;
			}));
		},
		coordinates() {
			return this.stacked.map((ps, i) => {
				const coords = ps.map((v, j) => [
					(this.nodeWidth / 2) + this.nodeWidth * j,
					new BigNumber(this.height - (this.height * 0.1)).minus(v.div(this.maxY).times(this.height * 0.8)).toNumber()
				]);

				coords.unshift([this.nodeWidth * -1, coords[0][1]]);
				coords.push([this.nodeWidth + this.width, coords[coords.length - 1][1]]);

				return coords;
			}).reverse();
		},
		lines() {
			return this.coordinates.map((v, i) => {
				return line()
					.x(d => d[0])
					.y(d => d[1])
					.curve(curveCardinal)(v);
			});
		},
		fillPaths() {
			return this.lines.map((l, i) => {
				return `${l} L ${this.coordinates[0][this.coordinates[0].length - 1][0]}, ${this.height + 50} L ${this.coordinates[0][0][0]}, ${this.height + 50} z`;
			});
		}
	},
	data() {
		return {
			width: 1000,
			height: 250
		};
	},
	beforeMount() {
		window.addEventListener('resize', this.onResize);
	},
	beforeDestroy() {
		window.removeEventListener('resize', this.onResize);
	},
	mounted() {
		this.onResize();
	},
	methods: {
		onResize() {
			this.width = this.$el.clientWidth;
			this.height = this.$el.clientHeight;
		}
	}
};
</script>

<style lang='stylus' scoped>
svg {
	display: block;
	width: 100%;
	height: 100%;
}

.point-bg {
	fill: bg-dark;
}
</style>