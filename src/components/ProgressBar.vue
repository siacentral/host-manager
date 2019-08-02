<template>
	<div class="progress-bar">
		<div class="progress-bar-progress" :style="barStyle"></div>
	</div>
</template>

<script>
export default {
	props: {
		progress: Number
	},
	computed: {
		barStyle() {
			return {
				width: `${this.progress}%`
			};
		}
	}
};
</script>

<style lang="stylus" scoped>
.progress-bar {
	height: 4px;
	border-radius: 4px;
	background: bg-dark-accent;
	overflow: hidden;

	.progress-bar-progress {
		height: 100%;
		background: primary;
		transition: width 0.3s ease;
		border-radius: 4px;
	}
}
</style>
