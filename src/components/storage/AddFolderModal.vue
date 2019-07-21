<template>
	<modal @close="$emit('close')" title="Add Storage Location">
		<div class="control control-search">
			<label>Path</label>
			<input type="text" v-model="path" />
			<button @click="onBrowsePath"><icon icon="search" /> Browse</button>
			<label class="error" v-if="errors['path']">{{ errors['path'] }}</label>
		</div>
		<div class="control">
			<label>Name</label>
			<input type="text" v-model="name" />
			<label class="error" v-if="errors['name']">{{ errors['name'] }}</label>
		</div>
		<div class="control">
			<label>Size</label>
			<input type="text" v-model="sizeStr" />
			<label class="error" v-if="errors['size']">{{ errors['size'] }}</label>
		</div>
		<div class="controls">
			<button class="btn btn-default btn-inline" @click="$emit('close')">Cancel</button>
			<button class="btn btn-success btn-inline" @click="onCreateFolder" :disabled="!valid">Add Folder</button>
		</div>
	</modal>
</template>

<script>
import Modal from '@/components/Modal';
import { BigNumber } from 'bignumber.js';
import { parseByteString } from '@/utils/parse';

const { dialog } = window.require('electron').remote;

export default {
	components: {
		Modal
	},
	data() {
		return {
			path: '',
			name: '',
			sizeStr: '100 GB',
			sizeValue: new BigNumber(0),
			errors: {},
			valid: false
		};
	},
	methods: {
		onBrowsePath() {
			try {
				this.errors['path'] = null;

				const paths = dialog.showOpenDialog({ title: 'Path for new Storage Folder', buttonLabel: 'Select', properties: ['openDirectory'] });

				this.path = paths ? paths[0] : null;
			} catch (ex) {
				console.log(ex);
			}
		},
		onCreateFolder() {
			try {
				this.validate();

				if (!this.valid)
					return;

				console.log(this.path, this.name, this.sizeValue);
			} catch (ex) {
				console.log(ex);
			}
		},
		validate() {
			let errors = {};

			if (!this.path || this.path.trim().length === 0)
				errors['path'] = 'Path is required';

			if (!this.name || this.name.trim().length === 0)
				errors['name'] = 'Name is required';

			try {
				this.sizeValue = parseByteString(this.sizeStr);

				if (!this.sizeValue || this.sizeValue.eq(0))
					errors['size'] = 'Size must be greater than 0';
			} catch (ex) {
				errors['size'] = ex.message;
			}

			this.valid = Object.keys(errors).length === 0;
			this.errors = errors;
		}
	},
	watch: {
		name() {
			this.validate();
		},
		sizeStr(val) {
			this.validate();
		}
	}
};
</script>

<style lang="stylus" scoped>
.controls {
	text-align: center;

	.btn:last-of-type {
		margin-right: 0;
	}
}
</style>