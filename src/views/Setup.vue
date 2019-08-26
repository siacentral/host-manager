<template>
	<div class="page setup-page">
		<transition name="fade" mode="out-in" appear>
			<welcome-step v-if="stepActive('welcome')" key="welcome" :import="imported" :config="config" :advanced="showAdvanced" @done="onStepComplete" />
			<import-step v-else-if="stepActive('import')" key="import" :import="imported" :config="config" :advanced="showAdvanced" @done="onStepComplete" />
			<consensus-location-step v-else-if="stepActive('consensus')" key="consensus" :config="config" :advanced="showAdvanced" @done="onStepComplete" />
			<daemon-override-step v-else-if="stepActive('settings')" key="settings" :config="config" :advanced="showAdvanced" @done="onStepComplete" />
			<review-step v-else-if="stepActive('review')" key="review" :config="config" :advanced="showAdvanced" @done="onStepComplete" />
			<create-wallet-step v-else-if="stepActive('create-wallet')" key="create-wallet" :config="config" :advanced="showAdvanced" @done="onStepComplete" />
		</transition>
	</div>
</template>

<script>
import log from 'electron-log';
import { mapActions } from 'vuex';

import WelcomeStep from '@/views/setup/WelcomeStep';
import ImportStep from '@/views/setup/ImportStep';
import ConsensusLocationStep from '@/views/setup/ConsensusLocationStep';
import DaemonOverrideStep from '@/views/setup/DaemonOverrideStep';
import ReviewStep from '@/views/setup/ReviewStep';
import CreateWalletStep from '@/views/setup/CreateWalletStep';
import { readSiaUIConfig, writeConfig } from '@/utils';
import { refreshData } from '@/data';

export default {
	components: {
		WelcomeStep,
		ImportStep,
		ConsensusLocationStep,
		DaemonOverrideStep,
		ReviewStep,
		CreateWalletStep
	},
	data() {
		return {
			loaded: false,
			step: 0,
			showAdvanced: false,
			createWallet: false,
			config: {
				dark_mode: true
			},
			imported: null
		};
	},
	computed: {
		steps() {
			const steps = ['welcome'];

			if (this.imported)
				steps.push('import');

			steps.push('consensus');

			if (this.showAdvanced)
				steps.push('settings');

			steps.push('review');

			if (this.createWallet)
				steps.push('create-wallet');

			return steps;
		}
	},
	async beforeMount() {
		try {
			const importConfig = await readSiaUIConfig();

			this.imported = importConfig;
		} catch (ex) {
			log.error('setup beforeMount', ex.message);
		} finally {
			this.loaded = true;
		}
	},
	methods: {
		...mapActions(['setFirstRun', 'setLoaded', 'setConfig']),
		stepActive(name) {
			return this.loaded && this.step === this.steps.indexOf(name.toLowerCase());
		},
		async onStepComplete(data) {
			try {
				this.config = data.config ? { ...this.config, ...data.config } : this.config;
				this.step += data.inc;

				if (typeof data.showAdvanced === 'boolean')
					this.showAdvanced = data.showAdvanced;

				if (typeof data.createWallet === 'boolean')
					this.createWallet = data.createWallet;

				if (this.step >= this.steps.length) {
					this.setLoaded(false);
					this.setConfig(this.config);
					this.setFirstRun(false);

					await refreshData();

					writeConfig(this.config);
				}
			} catch (ex) {
				log.error('onStepComplete', ex.message);
			}
		}
	}
};
</script>

<style lang="stylus" scoped>
	.setup-page {
		position: relative;
		width: 100%;
		height: 100%;
		overflow: hidden;
	}
</style>
