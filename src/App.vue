<template>
	<div id="app">
		<div class="titlebar"></div>
		<loader v-if="!loaded || !animationComplete" @animated="animationComplete = true" text="Getting things started..." />
		<transition name="slide-right" appear>
			<primary-nav />
		</transition>
		<div :class="{ 'app-content': true, 'app-navigation': showNavigation }">
			<transition name="fade" appear>
				<router-view/>
			</transition>
		</div>
		<notification-queue />
	</div>
</template>
<script>
import PrimaryNav from '@/components/PrimaryNav';
import Loader from '@/components/Loader';
import NotificationQueue from '@/components/NotificationQueue';

import { mapActions, mapState } from 'vuex';
import { refreshData } from '@/data';

export default {
	components: {
		Loader,
		PrimaryNav,
		NotificationQueue
	},
	methods: {
		...mapActions(['setConfig'])
	},
	data() {
		return {
			animationComplete: false
		};
	},
	async beforeMount() {
		try {
			this.$router.replace({ name: 'dashboard' });
			await refreshData();
		} catch (ex) {
			console.log(ex);
		}
	},
	computed: {
		...mapState(['config', 'loaded']),
		showNavigation() {
			return !this.$route.meta || !this.$route.meta.hide_navigation;
		}
	},
	watch: {
		config(val) {
			if (val.dark_mode)
				document.body.classList.add('dark');
			else
				document.body.classList.remove('dark');
		}
	}
};
</script>
<style lang="stylus">
@require "./styles/global";

.titlebar {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	height: 20px;
	-webkit-user-select: none;
	-webkit-app-region: drag;
}

#app {
	width: 100%;
	height: 100%;
}

.app-content {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	transition: left 0.4s linear;

	&.app-navigation {
		left: 200px;
	}
}
</style>
