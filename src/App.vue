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
			<setup v-if="firstRun && animationComplete" key="setup" />
			<change-api-credentials v-else-if="criticalError === 'API credentials invalid'" :config="config" @changed="onChangeAPIPassword" />
			<loader v-else-if="showLoader" key="loader" @animated="animationComplete = true" :progress="loaderProgress" :text="loaderText" :severity="loaderSeverity" :subText="loaderSubtext" />
			<unlock-wallet v-else-if="animationComplete && !walletUnlocked && !walletScanning" key="unlock" />
			<primary-view v-else key="primary" />
		</transition>
		<notification-queue />
	</div>
</template>
<script>
import { mapActions, mapState, mapGetters } from 'vuex';
import log from 'electron-log';

import { launch, running } from '@/sync/daemon';
import { refreshData } from '@/sync';
import { writeConfig } from '@/utils';

import ChangeApiCredentials from '@/views/ChangeAPICredentials';
import Loader from '@/views/Loader';
import NotificationQueue from '@/components/NotificationQueue';
import PrimaryView from '@/views/PrimaryView';
import UnlockWallet from '@/views/wallet/UnlockWallet';
import Setup from '@/views/Setup';

export default {
	components: {
		ChangeApiCredentials,
		Loader,
		NotificationQueue,
		PrimaryView,
		Setup,
		UnlockWallet
	},
	async beforeMount() {
		document.body.classList.add('dark', process.platform);
		await this.tryLoad();
	},
	methods: {
		...mapActions(['setConfig', 'pushNotification', 'setLoaded', 'setCriticalError',
			'setFirstRun']),
		...mapActions('setup', ['setFirstRun']),
		async tryLoad() {
			try {
				if (this.$route.name !== 'dashboard')
					this.$router.replace({ name: 'dashboard' });

				if (!this.config)
					return;

				if (await running()) {
					await refreshData();
					return;
				}

				launch();
			} catch (ex) {
				log.error('try load', ex);
				this.setCriticalError(ex.message);
			}
		},
		async onChangeAPIPassword(password) {
			try {
				const config = {
					...this.config,
					siad_api_password: password
				};

				this.setConfig(config);
				await writeConfig(config);
				this.setCriticalError(null);
				refreshData(config);
			} catch (ex) {
				log.error('App.onChangeAPIPassword', ex);
				this.setCriticalError(ex.message);
			}
		},
		onMinWindow() {
			try {
				/* const window = remote.getCurrentWindow();
				window.minimize(); */
			} catch (ex) {
				log.error('minimize window', ex);
			}
		},
		onMaxWindow() {
			try {
				/* const window = remote.getCurrentWindow();
				window.isMaximized() ? window.unmaximize() : window.maximize(); */
			} catch (ex) {
				log.error('maximize window', ex);
			}
		},
		onCloseWindow() {
			try {
				/* const window = remote.getCurrentWindow();
				window.close(); */
			} catch (ex) {
				log.error('close window', ex);
			}
		}
	},
	data() {
		return {
			animationComplete: false
		};
	},
	computed: {
		...mapGetters(['alerts']),
		...mapState({
			config: state => state.config,
			dataLoaded: state => state.loaded,
			refreshingData: state => state.refreshingData,
			firstRun: state => state.setup.firstRun,
			criticalError: state => state.criticalError,
			walletUnlocked: state => state.hostWallet.unlocked,
			walletScanning: state => state.hostWallet.rescanning,
			scanHeight: state => state.hostWallet.height,
			lastBlock: state => state.lastBlock,
			daemonLoaded: state => state.hostDaemon.loaded,
			daemonLoadingModule: state => state.hostDaemon.currentModule,
			daemonLoadPercent: state => state.hostDaemon.loadPercent,
			daemonManaged: state => state.hostDaemon.managed,
			daemonStatus: state => state.hostDaemon.status
		}),
		showLoader() {
			return this.daemonStatus || !this.dataLoaded || this.criticalError || (!this.daemonLoaded && this.daemonManaged) || this.walletScanning || !this.animationComplete;
		},
		loaderText() {
			if (this.daemonStatus === 'shutdown')
				return 'Shutting down... Please wait...';

			if (this.daemonStatus === 'restart')
				return 'Restarting Sia... Please wait...';

			if (this.criticalError && !this.firstRun)
				return 'Uh Oh! We\'ve run into a problem.';

			if (!this.daemonLoaded && this.daemonManaged)
				return 'Loading daemon...';

			if (this.refreshingData)
				return 'Syncing data from Sia... This may take a minute...';

			if (this.firstRun)
				return 'Welcome to Sia Host Manager!';

			if (this.walletScanning)
				return 'Your wallet is scanning...';

			return 'Getting things started...';
		},
		loaderSeverity() {
			if (this.criticalError)
				return 'danger';

			return 'success';
		},
		loaderProgress() {
			if (this.walletScanning)
				return this.scanHeight / this.lastBlock;

			if (!this.daemonLoaded && this.daemonManaged)
				return this.daemonLoadPercent || 0;

			return 0;
		},
		loaderSubtext() {
			if (this.daemonStatus === 'shutdown')
				return 'Cleanly shutting down Sia... This can take a while...';

			if (this.daemonStatus === 'restart')
				return null;

			if (this.criticalError)
				return this.criticalError;

			if (this.walletScanning)
				return `Scanned to ${this.scanHeight}`;

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
		},
		alerts(newAlerts, oldAlerts) {
			if (!this.loaded)
				return;

			const sendPush = newAlerts.filter(a => {
				const existing = oldAlerts.find(existing => a.message === existing.message);

				return !existing && a.severity === 'danger';
			});

			if (sendPush.length === 0)
				return;

			sendPush.forEach(a => {
				this.pushNotification(a);
			});
		}
	}
};
</script>
<style lang="stylus">
/** Not scoped, be careful */
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

body.linux {
	.titlebar {
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
