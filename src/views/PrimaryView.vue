<template>
	<div class="app-wrapper">
		<primary-nav />
		<div class="app-content">
			<transition name="fade" appear>
				<router-view />
			</transition>
		</div>
	</div>
</template>

<script>
import PrimaryNav from '@/components/PrimaryNav';

export default {
	components: {
		PrimaryNav
	}
};
</script>

<style lang="stylus" scoped>
.app-wrapper {
	width: 100%;
	height: 100%;

	.app-content {
		position: fixed;
		top: 0;
		left: 200px;
		bottom: 0;
		right: 0;
		overflow: hidden;
		transition: left 0.4 ease;
	}
}

body.win32 {
	.app-content {
		top: 32px;
	}
}
</style>
