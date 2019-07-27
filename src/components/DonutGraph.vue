<template>
	<div class="graph">
		<svg class="graph" viewBox="0 0 42 42">
			<circle cx="21" cy="21" r="15.91549430918952" fill="transparent"
				stroke-width="1.5" stroke="#25272a"></circle>
			<circle :class="{ 'segment-active': selectedIndex === segment.index }" @click="onClickSegment(segment)" v-for="segment in segments"
				:key="segment.index" cx="21" cy="21" r="15.91549430918952" fill="transparent"
				stroke-width="1.5" :stroke="segment.color" :stroke-dasharray="segment.segment"
				:stroke-dashoffset="segment.offset" pointer-events="visibleStroke"></circle>
		</svg>
		<div class="info-box">
			<div class="icon" v-if="icon"><icon :icon="icon" /></div>
			<div class="title">{{ displayTitle }}</div>
			<div class="value">{{ displayValue }}</div>
		</div>
	</div>
</template>

<script>
export default {
	props: {
		data: Array,
		title: String,
		value: String,
		icon: String,
		defaultIndex: Number
	},
	data() {
		return {
			selectedIndex: this.defaultIndex === null ? -1 : this.defaultIndex
		};
	},
	computed: {
		displayTitle() {
			if (this.selectedIndex < 0 || !this.data[this.selectedIndex])
				return this.title;

			return this.data[this.selectedIndex].title;
		},
		displayValue() {
			if (this.selectedIndex < 0 || !this.data[this.selectedIndex])
				return this.value;

			return this.data[this.selectedIndex].text;
		},
		segments() {
			if (!Array.isArray(this.data))
				return [];

			let offset = 0;

			const segments = this.data.reduce((segments, seg, i) => {
				let perc = Math.round(seg.value * 100),
					segmentOffset = 100 - offset;

				if (perc === 0)
					return segments;

				if (perc + offset > 100)
					perc = 100 - offset;

				offset = perc + offset;

				segments.push({
					segment: `${perc} ${100 - perc}`,
					offset: segmentOffset,
					color: seg.color || '#ce4b99',
					index: i
				});

				return segments;
			}, []);

			segments.sort((a, b) => {
				if (a.segment > b.segment)
					return -1;

				if (a.segment < b.segment)
					return 1;

				return 0;
			});

			return segments;
		}
	},
	methods: {
		onClickSegment(segment) {
			if (this.selectedIndex === segment.index) {
				this.selectedIndex = this.defaultIndex === null ? -1 : this.defaultIndex;
				return;
			}

			this.selectedIndex = segment.index;
		}
	}
};
</script>

<style lang="stylus" scoped>
.graph {
	position: relative;

	svg.graph {
		display: block;
		height: 100%;
		width: 100%;
	}

	circle {
		transform-origin: 50% 50%;
		transition:	all 0.3s linear;
		cursor: pointer;
		pointer-events: visibleStroke;
	}

	.segment-active {
		transform: scale(1.1);
	}

	.info-box {
		position: absolute;
		left: 0;
		right: 0;
		top: 50%;
		text-align: center;
		transform: translateY(-50%);

		.icon {
			margin-bottom: 15px;
			svg {
				width: 40px;
				height: 40px;
			}
		}

		.title {
			font-size: 1rem;
			margin-bottom: 3px;
			color: rgba(255, 255, 255, 0.54);
		}

		.value {
			font-size: 1.4rem;
		}
	}
}
</style>
