<template>
	<div class="page setup-page">
		<welcome-step v-if="stepActive('welcome')" :import="imported" :fresh="freshInstall" :config="config" @done="onStepComplete" />
		<import-step v-if="stepActive('import')" :import="imported" :fresh="freshInstall" :config="config" @done="onStepComplete" />
		<consensus-location-step v-if="stepActive('consensus')" :fresh="freshInstall" :config="config" @done="onStepComplete" />
		<daemon-override-step v-if="stepActive('settings')" :fresh="freshInstall" :config="config" @done="onStepComplete" />
		<auto-unlock-step v-if="stepActive('unlock')" :fresh="freshInstall" :config="config" @done="onStepComplete" />
		<review-step v-if="stepActive('review')" :fresh="freshInstall" :config="config" @done="onStepComplete" />
	</div>
</template>

<script>
import WelcomeStep from '@/components/setup/WelcomeStep';
import ImportStep from '@/components/setup/ImportStep';
import ConsensusLocationStep from '@/components/setup/ConsensusLocationStep';
import DaemonOverrideStep from '@/components/setup/DaemonOverrideStep';
import AutoUnlockStep from '@/components/setup/AutoUnlockStep';
import ReviewStep from '@/components/setup/ReviewStep';
import { readSiaUIConfig } from '@/utils';

export default {
	name: 'setup',
	data() {
		return {
			loaded: false,
			step: 0,
			freshInstall: false,
			config: {},
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
			console.log(ex);
		} finally {
			this.loaded = true;
		}
	},
	methods: {
		stepActive(name) {
			const steps = ['welcome', 'import', 'consensus', 'settings', 'unlock', 'review'];

			return this.loaded && this.step === steps.indexOf(name.toLowerCase());
		},
		onStepComplete(data) {
			this.config = data.config ? { ...this.config, ...data.config } : this.config;
			this.step += data.inc;

			if (typeof data.freshInstall === 'boolean')
				this.freshInstall = data.freshInstall;
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
