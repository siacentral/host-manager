<template>
	<setup-step>
		<div class="setup-icon">
			<SiaCentralSia />
		</div>
		<h1>Welcome to SiaCentral Desktop</h1>
		<p>SiaCentral Desktop provides complete control over all aspects of your host as well as additional insights into the health of your host.</p>
		<p>We need to ask you some questions about your host before we get started.</p>

		<template v-slot:controls>
			<button class="btn btn-success btn-inline" @click="onNext">Get Started</button>
		</template>
	</setup-step>
</template>

<script>
import SetupStep from './SetupStep';
import SiaCentralSia from '@/assets/siacentral+sia.svg';

export default {
	name: 'welcome-step',
	props: {
		config: Object,
		import: Object
	},
	components: {
		SetupStep,
		SiaCentralSia
	},
	methods: {
		onNext() {
			this.$emit('done', { inc: 1 });
		}
	}
};
</script>
