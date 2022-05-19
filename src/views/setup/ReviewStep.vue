<template>
	<setup-step>
		<template v-slot:info>
			<div class="setup-icon">
				<sia-central />
			</div>
			<transition mode="out-in" appear>
				<h1 key="error" v-if="error">Uh oh!</h1>
				<h1 key="success" v-else>Thank you!</h1>
			</transition>
		</template>
		<transition mode="out-in" appear>
			<p class="text-center error" v-if="error" key="error"> We were unable to validate your config. Go back and check what you entered:<br/>{{ error }}</p>
			<div class="loading" v-else-if="daemonManaged && !daemonLoaded" key="daemon">
				<p class="text-center">Loading {{ daemonLoadingModule || 'Sia' }}...</p>
				<progress-bar :progress="daemonLoadPercent * 100" />
			</div>
			<p class="text-center" v-else-if="refreshingData" key="data">We're retrieving data from Sia... This may take a while...</p>
			<p class="text-center" v-else key="success">We're getting everything setup, please wait a moment...</p>
		</transition>
		<template v-slot:controls>
			<transition mode="out-in" name="fade" appear>
				<button v-if="error" class="btn btn-success btn-inline" @click="$emit('done', { inc: -1 })">Go Back</button>
			</transition>
		</template>
	</setup-step>
</template>

<script>
import log from 'electron-log';
import { ipcRenderer } from 'electron';
import { mapActions, mapState } from 'vuex';

import { refreshData } from '@/sync';
import { launch, running } from '@/sync/daemon';
import SiaApiClient from '@/api/sia';
import ProgressBar from '@/components/ProgressBar';

import SetupStep from './SetupStep';
import SiaCentral from '@/components/svg/SiaCentral';

export default {
	components: {
		ProgressBar,
		SetupStep,
		SiaCentral
	},
	props: {
		config: Object,
		fresh: Boolean
	},
	computed: {
		...mapState({
			refreshingData: state => state.refreshingData,
			walletEncrypted: state => state.hostWallet.encrypted,
			walletUnlocked: state => state.hostWallet.unlocked,
			walletScanning: state => state.hostWallet.scanning,
			daemonLoaded: state => state.hostDaemon.loaded,
			daemonLoadingModule: state => state.hostDaemon.currentModule,
			daemonLoadPercent: state => state.hostDaemon.loadPercent,
			daemonManaged: state => state.hostDaemon.managed,
			criticalError: state => state.criticalError
		})
	},
	data() {
		return {
			error: null
		};
	},
	async mounted() {
		try {
			this.setConfig(this.config);

			if (await running()) {
				this.syncDaemon();
				return;
			}

			ipcRenderer.once('daemonLoaded', this.onDaemonLoaded);
			launch();
		} catch (ex) {
			log.error('review step mounted', ex.message);
			this.error = ex.message;
		}
	},
	methods: {
		...mapActions(['setConfig']),
		...mapActions('setup', ['setFirstRun']),
		async syncDaemon() {
			try {
				const client = new SiaApiClient(this.config);

				if (!(await client.checkCredentials()))
					throw new Error('Unable to authenticate check API address or password');

				await refreshData(this.config);

				this.$emit('done', {
					inc: 1,
					createWallet: !this.walletUnlocked && !this.walletEncrypted
				});

				return true;
			} catch (ex) {
				log.error('on daemon loaded', ex.message);
				this.error = ex.message;
			}

			return false;
		},
		async onDaemonLoaded() {
			if (await this.syncDaemon())
				return;

			try {
				const client = new SiaApiClient(this.config);

				await client.stopDaemon();
			} catch (ex) {}
		}
	},
	watch: {
		criticalError(val) {
			this.error = val;
		}
	}
};
</script>
