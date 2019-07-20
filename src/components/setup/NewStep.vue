<template>
	<setup-step>
		<template v-slot:info>
			<div class="setup-icon">
				<sia-logo />
			</div>
			<h3>Would you like to use an existing install of Sia?</h3>
			<p>SiaCentral can use an existing install of Sia or we can start from scratch if you don't have Sia installed already.</p>
		</template>
		<template v-slot:controls>
			<button class="btn btn-inline" @click="onNext(1, false)">Use Existing Sia Install</button>
			<button class="btn btn-success btn-inline" @click="onNext(1, true)" >Start from Scratch</button>
		</template>
	</setup-step>
</template>

<script>
import SetupStep from './SetupStep';
import SiaLogo from '@/assets/sia.svg';

export default {
	name: 'new-step',
	components: {
		SetupStep,
		SiaLogo
	},
	props: {
		config: Object
	},
	data() {
		return {
			siadLocation: null
		};
	},
	methods: {
		onNext(n, install) {
			this.$emit('done', {
				inc: n,
				freshInstall: install,
				config: {
					siad_path: this.siadLocation
				}
			});
		}
	}
};
</script>
