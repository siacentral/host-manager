<template>
	<setup-step>
		<template v-slot:info>
			<div class="setup-icon">
				<SiaCentralSia />
			</div>
			<h3>Would you like to link Host Manager to Sia-UI?</h3>
			<p>This ensures that Sia-UI and Host Manager will share the same Sia wallet.</p>
		</template>

		<template v-slot:controls>
			<button class="btn btn-inline" @click="onNext(false)">No Thanks</button>
			<button class="btn btn-success btn-inline" @click="onNext(true)">Link</button>
		</template>
	</setup-step>
</template>

<script>
import log from 'electron-log';
import SetupStep from './SetupStep';
import SiaCentralSia from '@/components/svg/SiaCentralSia';

export default {
	props: {
		config: Object,
		import: Object,
		advanced: Boolean
	},
	data() {
		return {
			setting: false
		};
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
		async onNext(doImport) {
			if (this.setting)
				return;

			try {
				const ev = { inc: 1 };

				ev.skipImport = !doImport;

				if (doImport)
					ev.config = { ...this.config, ...this.import };

				this.$emit('done', ev);
			} catch (ex) {
				log.error('import setup', ex.message);
			} finally {
				this.setting = false;
			}
		}
	}
};
</script>
