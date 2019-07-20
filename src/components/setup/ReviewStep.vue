<template>
	<setup-step>
		<template v-slot:info>
			<div class="setup-icon">
				<sia-central />
			</div>
			<h1>Thank you!</h1>
			<p class="text-center">We're getting everything setup, please wait a moment...</p>
		</template>
	</setup-step>
</template>

<script>
import { mapActions } from 'vuex';

import SetupStep from './SetupStep';
import SiaCentral from '@/assets/siacentral.svg';

import { writeConfig } from '@/utils';

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
	async mounted() {
		try {
			await writeConfig(this.config);

			this.setConfig(this.config);
			this.$router.push({ name: 'dashboard' });
		} catch (ex) {
			console.log(ex);
		}
	},
	methods: {
		...mapActions(['setConfig'])
	}
};
</script>
