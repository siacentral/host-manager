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
			<button class="btn btn-success btn-inline" @click="onNext(1)" :disabled="setting">Next</button>
		</template>
	</setup-step>
</template>

<script>
import { remote } from 'electron';
import path from 'path';
import log from 'electron-log';
import SetupStep from './SetupStep';

const dialog = remote.dialog,
	app = remote.app;

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
			consensusLocation: null,
			setting: false
		};
	},
	methods: {
		onSearchFile() {
			const paths = dialog.showOpenDialog({ title: 'Locate Your Sia Data Path', buttonLabel: 'Select', properties: ['openDirectory'] });

			this.consensusLocation = paths ? paths[0] : null;
		},
		async onNext(n) {
			if (this.setting)
				return;

			try {
				let consensusPath;

				this.setting = true;

				if (!this.consensusLocation || this.consensusLocation.length === 0)
					consensusPath = path.join(app.getPath('userData'), 'sia');
				else
					consensusPath = this.consensusLocation;

				const ev = {
					inc: n,
					config: {
						siad_data_path: consensusPath
					}
				};

				this.$emit('done', ev);
			} catch (ex) {
				log.error('consensus location setup', ex.message);
			} finally {
				this.setting = false;
			}
		}
	}
};
</script>
