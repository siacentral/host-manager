<template>
	<setup-step>
		<div class="setup-icon">
			<SiaCentralSia />
		</div>
		<h1>Welcome to Sia Host Manager</h1>
		<p>Sia Host Manager provides complete control over all aspects of your host as well as additional insights into the health of your host.</p>
		<p>We need to ask you some questions about your host before we get started.</p>

		<template v-slot:controls>
			<button class="btn btn-success btn-inline" @click="onNext">Get Started</button>
			<div class="control control-inline">
				<input type="checkbox" id="chk-show-advanced" v-model="showAdvanced" />
				<label for="chk-show-advanced">Show Advanced</label>
			</div>
		</template>
	</setup-step>
</template>

<script>
import SetupStep from './SetupStep';
import SiaCentralSia from '@/components/svg/SiaCentralSia';

export default {
	props: {
		config: Object,
		import: Object
	},
	data() {
		return {
			showAdvanced: false
		};
	},
	components: {
		SetupStep,
		SiaCentralSia
	},
	methods: {
		onNext() {
			this.$emit('done', { inc: 1, showAdvanced: this.showAdvanced });
		}
	}
};
</script>
