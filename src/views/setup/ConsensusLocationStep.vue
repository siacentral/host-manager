<template>
	<setup-step>
		<template v-slot:info>
			<div class="setup-icon">
				<icon icon="database" />
			</div>
			<h3>Would you like to move your Sia Data Path?</h3>
			<p>Some hosts like to store their consensus data on a different harddrive from Sia. Leave the field blank to use the default.</p>
		</template>
		<div class="control control-search">
			<label>Path to Sia Data</label>
			<input type="text" v-model="consensusLocation" />
			<button @click="onSearchFile"><icon icon="search" /> Browse</button>
		</div>
		<template v-slot:controls>
			<button class="btn btn-success btn-inline" @click="onNext(1)">Next</button>
		</template>
	</setup-step>
</template>

<script>
import SetupStep from './SetupStep';
import { remote } from 'electron';

const dialog = remote.dialog;

export default {
	components: {
		SetupStep
	},
	props: {
		config: Object,
		fresh: Boolean
	},
	data() {
		return {
			consensusLocation: null
		};
	},
	methods: {
		onSearchFile() {
			const paths = dialog.showOpenDialog({ title: 'Locate Your Sia Data Path', buttonLabel: 'Select', properties: ['openDirectory'] });

			this.consensusLocation = paths ? paths[0] : null;
		},
		onNext(n) {
			this.$emit('done', {
				inc: n,
				config: {
					siad_data_path: this.consensusLocation
				}
			});
		}
	}
};
</script>
