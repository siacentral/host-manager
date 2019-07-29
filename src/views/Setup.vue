<template>
	<div class="page setup-page">
		<transition name="fade" mode="out-in" appear>
			<welcome-step v-if="stepActive('welcome')" key="welcome" :import="imported" :config="config" :advanced="showAdvanced" @done="onStepComplete" />
			<import-step v-else-if="stepActive('import')" key="import" :import="imported" :config="config" :advanced="showAdvanced" @done="onStepComplete" />
			<consensus-location-step v-else-if="stepActive('consensus')" key="consensus" :config="config" :advanced="showAdvanced" @done="onStepComplete" />
			<daemon-override-step v-else-if="stepActive('settings')" key="settings" :config="config" :advanced="showAdvanced" @done="onStepComplete" />
			<auto-unlock-step v-else-if="stepActive('unlock')" key="unlock" :config="config" :advanced="showAdvanced" @done="onStepComplete" />
			<review-step v-else-if="stepActive('review')" key="review" :config="config" :advanced="showAdvanced" @done="onStepComplete" />
		</transition>
	</div>
</template>

<script>
import log from 'electron-log';

import WelcomeStep from '@/views/setup/WelcomeStep';
import ImportStep from '@/views/setup/ImportStep';
import ConsensusLocationStep from '@/views/setup/ConsensusLocationStep';
import DaemonOverrideStep from '@/views/setup/DaemonOverrideStep';
import AutoUnlockStep from '@/views/setup/AutoUnlockStep';
import ReviewStep from '@/views/setup/ReviewStep';
import { readSiaUIConfig } from '@/utils';

export default {
	data() {
		return {
			loaded: false,
			step: 0,
			showAdvanced: false,
			config: {
				dark_mode: true,
				siad_api_addr: null
			},
			imported: null
		};
	},
	components: {
		WelcomeStep,
		ImportStep,
		ConsensusLocationStep,
		DaemonOverrideStep,
		AutoUnlockStep,
		ReviewStep
	},
	async beforeMount() {
		try {
			const importConfig = await readSiaUIConfig();

			this.imported = importConfig;
		} catch (ex) {
			log.error(ex.message);
		} finally {
			this.loaded = true;
		}
	},
	methods: {
		stepActive(name) {
			const steps = ['welcome'];

			if (this.imported)
				steps.push('import');

			steps.push('consensus');

			if (this.showAdvanced)
				steps.push('settings');

			steps.push('unlock', 'review');

			return this.loaded && this.step === steps.indexOf(name.toLowerCase());
		},
		onStepComplete(data) {
			this.config = data.config ? { ...this.config, ...data.config } : this.config;
			this.step += data.inc;

			if (typeof data.showAdvanced === 'boolean')
				this.showAdvanced = data.showAdvanced;
		}
	}
};
</script>

<style lang="stylus" scoped>
	.setup-page {
		position: relative;
		width: 100%;
		height: 100%;
	}
</style>
