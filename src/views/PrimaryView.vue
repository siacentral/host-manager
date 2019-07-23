<template>
	<div :class="{ 'app-wrapper': true, 'app-navigation': showNavigation }">
		<transition name="slide-right" appear>
			<primary-nav v-if="showNavigation" />
		</transition>
		<div class="app-content">
			<transition name="fade" appear>
				<router-view/>
			</transition>
		</div>
		<notification-queue />
	</div>
</template>

<script>
import NotificationQueue from '@/components/NotificationQueue';
import PrimaryNav from '@/components/PrimaryNav';

export default {
	components: {
		NotificationQueue,
		PrimaryNav
	},
	computed: {
		showNavigation() {
			return !this.$route.meta || !this.$route.meta.hide_navigation;
		}
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
		left: 0;
		bottom: 0;
		right: 0;
		overflow: hidden;
		transition: left 0.4 ease;
	}

	&.app-navigation .app-content {
		left: 200px;
	}
}

body.win32 {
	.app-content {
		top: 32px;
	}
}
</style>
