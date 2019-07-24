<template>
	<div id="app">
		<div class="titlebar">
			<button @click="onCloseWindow">
				<span>&#xE8BB;</span>
			</button>
			<button @click="onMaxWindow">
				<span>&#xE922;</span>
			</button>
			<button @click="onMinWindow">
				<span>&#xE921;</span>
			</button>
		</div>
		<transition name="fade" mode="out-in" appear>
			<loader v-if="showLoader" key="loader" @animated="animationComplete = true" :progress="loaderProgress" :text="loaderText" :severity="loaderSeverity" :subText="loaderSubtext" />
			<primary-view v-else key="primary" />
		</transition>
	</div>
</template>
<script>
import { remote } from 'electron';
import Loader from '@/views/Loader';
import PrimaryView from '@/views/PrimaryView';

import { mapActions, mapState } from 'vuex';
import { refreshData } from '@/data';
import { launch } from '@/utils/daemon';
import { listen } from '@/data/sync';
import log from 'electron-log';

export default {
	components: {
		Loader,
		PrimaryView
	},
	methods: {
		...mapActions(['setConfig', 'setCriticalError']),
		async tryLoad() {
			try {
				if (!this.config) {
					this.$router.replace({ name: 'setup' });
					return;
				}

				this.$router.replace({ name: 'dashboard' });
				await launch();
				await refreshData();

				this.createWallet = !this.walletUnlocked && !this.walletEncrypted;
			} catch (ex) {
				log.error(ex);
				this.setCriticalError(ex.message);
			}
		},
		onMinWindow() {
			try {
				const window = remote.getCurrentWindow();
				window.minimize();
			} catch (ex) {
				log.error(ex);
			}
		},
		onMaxWindow() {
			try {

			} catch (ex) {
				log.error(ex);
			}
		},
		onCloseWindow() {
			try {
				const window = remote.getCurrentWindow();
				window.close();
			} catch (ex) {
				log.error(ex);
			}
		}
	},
	data() {
		return {
			animationComplete: false,
			createWallet: false
		};
	},
	beforeMount() {
		this.tryLoad();
		listen();
	},
	computed: {
		...mapState({
			config: state => state.config,
			dataLoaded: state => state.loaded,
			firstRun: state => state.firstRun,
			criticalError: state => state.criticalError,
			walletUnlocked: state => state.hostWallet.unlocked,
			walletEncrypted: state => state.hostWallet.encrypted,
			daemonLoaded: state => state.hostDaemon.loaded,
			daemonLoadingModule: state => state.hostDaemon.currentModule,
			daemonLoadPercent: state => state.hostDaemon.loadPercent,
			daemonManaged: state => state.hostDaemon.managed
		}),
		showLoader() {
			if (this.firstRun && this.animationComplete)
				return false;

			if (this.criticalError || (!this.daemonLoaded && this.daemonManaged) || !this.animationComplete)
				return true;

			if (!this.firstRun && !this.dataLoaded)
				return true;

			return false;
		},
		loaderText() {
			if (this.criticalError && !this.firstRun)
				return 'Uh Oh! We\'ve run into a problem.';

			if (!this.daemonLoaded && this.daemonManaged)
				return 'Loading daemon';

			if (this.firstRun)
				return 'Welcome to Sia Central Desktop!';

			return 'Getting things started...';
		},
		loaderSeverity() {
			if (this.criticalError)
				return 'danger';

			return 'success';
		},
		loaderProgress() {
			if (!this.daemonLoaded && this.daemonManaged)
				return Math.ceil(this.daemonLoadPercent * 100) || 0;

			return 0;
		},
		loaderSubtext() {
			if (this.criticalError)
				return this.criticalError;

			if (!this.daemonLoaded && this.daemonManaged && this.daemonLoadingModule)
				return this.daemonLoadingModule;

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
	z-index: 1000;

	button {
		display: none;
	}
}

body.win32 {
	.titlebar {
		height: 32px;

		button {
			display: inline-block;
			width: 46px;
			height: 32px;
			text-align: center;
			border: none;
			outline: none;
			background: none;
			font-family: "Segoe MDL2 Assets";
			font-size: 10px;
			color: rgba(255, 255, 255, 0.84);
			cursor: pointer;
			float: right;
			-webkit-app-region: none;

			&:hover, &:active, &:focus {
				color: primary;
			}
		}
	}
}

#app {
	width: 100%;
	height: 100%;
}
</style>
