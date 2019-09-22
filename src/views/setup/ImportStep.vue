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
import log from 'electron-log';
import { checkSiaDataFolders } from '@/utils';
import SetupStep from './SetupStep';
import SiaCentralSia from '@/assets/siacentral+sia.svg';

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

				if (doImport) {
					ev.config = { ...this.config, ...this.import };

					const missingFolders = await checkSiaDataFolders(ev.config.siad_data_path);

					if (missingFolders.indexOf('consensus') >= 0)
						ev.needsBootstrap = true;
				}

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
