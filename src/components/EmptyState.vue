<template>
	<transition name="fade" appear>
		<div class="empty-state">
			<div class="empty-state-content">
				<icon :icon="icon" />
				<div class="empty-state-text" v-if="text">{{ text }}</div>
			</div>
		</div>
	</transition>
</template>

<script>
export default {
	props: {
		icon: String,
		text: String
	}
};
</script>

<style lang="stylus" scoped>
.empty-state {
	width: 100%;
	height: 100%;

	.empty-state-content {
		display: grid;
		width: 100%;
		height: 100%;
		max-width: 800px;
		margin: auto;
		padding: 30px;
		grid-template-rows: repeat(2, auto);
		grid-gap: 30px;
		text-align: center;
		align-content: center;
		justify-content: center;
	}

	.empty-state-text {
		font-size: 1.4rem;
		color: rgba(255, 255, 255, 0.54);
	}

	svg {
		animation: rotateSVG 3s ease infinite;
		animation-delay: 3s;
		width: 60px;
		height: 60px;
		margin: auto;
		color: primary;
	}
}
</style>
