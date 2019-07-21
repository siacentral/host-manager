<template>
	<div id="app">
		<div class="titlebar"></div>
		<transition name="fade" mode="out-in" appear>
			<loader v-if="showLoader" key="loader" @animated="animationComplete = true" :text="loaderText" :severity="loaderSeverity" :subText="loaderSubtext" />
			<create-wallet key="create-wallet" v-else-if="fullyLoaded && createWallet" @close="createWallet = false" />
			<primary-view v-else key="primary" />
		</transition>
	</div>
</template>
<script>
import Loader from '@/components/Loader';
import CreateWallet from '@/components/setup/CreateWallet';
import PrimaryView from '@/views/PrimaryView';

import { mapActions, mapState } from 'vuex';
import { refreshData } from '@/data';

export default {
	components: {
		CreateWallet,
		Loader,
		PrimaryView
	},
	methods: {
		...mapActions(['setConfig'])
	},
	data() {
		return {
			animationComplete: false,
			createWallet: false
		};
	},
	async beforeMount() {
		try {
			if (!this.config) {
				this.$router.replace({ name: 'setup' });
				return;
			}

			this.$router.replace({ name: 'dashboard' });
			await refreshData();

			this.createWallet = !this.unlocked && !this.encrypted;
		} catch (ex) {
			console.log(ex);
		}
	},
	computed: {
		...mapState(['config', 'loaded', 'firstRun', 'criticalError']),
		...mapState('hostWallet', ['unlocked', 'encrypted']),
		fullyLoaded() {
			return this.loaded && this.animationComplete;
		},
		showLoader() {
			if (!this.firstRun && this.criticalError)
				return true;

			if (!this.firstRun && !this.loaded)
				return true;

			if (!this.animationComplete)
				return true;

			return false;
		},
		loaderText() {
			if (this.criticalError)
				return 'Uh Oh! We\'ve run into a problem.';

			if (this.firstRun)
				return 'Welcome to Sia Central Desktop!';

			return 'Getting things started...';
		},
		loaderSeverity() {
			if (this.criticalError)
				return 'danger';

			return 'success';
		},
		loaderSubtext() {
			if (this.criticalError)
				return this.criticalError;

			return null;
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
</style>
