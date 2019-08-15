<template>
	<setup-step>
		<template v-slot:info>
			<div class="setup-icon">
				<SiaCentralSia />
			</div>
			<h3>Would you like to import your configuration?</h3>
			<p>It looks like you already have Sia-UI. Would you like to import your configuration?
				This will save you a little time with the initial setup.</p>
		</template>

		<template v-slot:controls>
			<button class="btn btn-inline" @click="onNext(false)">No Thanks</button>
			<button class="btn btn-success btn-inline" @click="onNext(true)">Import</button>
		</template>
	</setup-step>
</template>

<script>
import SetupStep from './SetupStep';
import SiaCentralSia from '@/assets/siacentral+sia.svg';

export default {
	props: {
		config: Object,
		import: Object,
		advanced: Boolean
	},
	beforeMount() {
		if (!this.import)
			this.$emit('done', { inc: 1 });
	},
	components: {
		SetupStep,
		SiaCentralSia
	},
	methods: {
		onNext(doImport) {
			const ev = { inc: 1 };

			if (doImport) {
				ev.inc = this.advanced ? 3 : 2;
				ev.config = { ...this.config, ...this.import };
			}

			this.$emit('done', ev);
		}
	}
};
</script>
