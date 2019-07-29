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
			<transition mode="out-in" appear>
				<p class="text-center error" v-if="error" key="error"> We were unable to validate your config. Go back and check what you entered:<br/>{{ error }}</p>
				<p class="text-center" v-else key="success">We're getting everything setup, please wait a moment...</p>
			</transition>
		</template>

		<template v-slot:controls>
			<transition appear>
				<button v-if="error" class="btn btn-success btn-inline" @click="$emit('done', { inc: -1 })">Go Back</button>
			</transition>
		</template>
	</setup-step>
</template>

<script>
import { mapActions } from 'vuex';
import log from 'electron-log';
import { writeConfig } from '@/utils';
import { refreshData } from '@/data/index';
import { launch } from '@/utils/daemon';
import SiaApiClient from '@/api/sia';

import SetupStep from './SetupStep';
import SiaCentral from '@/assets/siacentral.svg';

export default {
	name: 'review-step',
	components: {
		SetupStep,
		SiaCentral
	},
	props: {
		config: Object,
		fresh: Boolean
	},
	data() {
		return {
			error: null
		};
	},
	async mounted() {
		try {
			log.info('launching');
			await launch(this.config);

			const client = new SiaApiClient(this.config);

			if (!(await client.checkCredentials()))
				throw new Error('Unable to authenticate check API address or password');

			this.setConfig(this.config);
			log.info('refreshing data');
			await refreshData();
			log.info('writing config');
			await writeConfig(this.config);
			log.info('changing page');
			this.$nextTick(() => this.$router.push({ name: 'dashboard' }));
			this.setFirstRun(false);
		} catch (ex) {
			log.error(ex.message);
			this.error = ex.message;
		}
	},
	methods: {
		...mapActions(['setConfig', 'setFirstRun'])
	}
};
</script>
