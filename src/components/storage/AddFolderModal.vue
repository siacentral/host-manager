<template>
	<modal @close="$emit('close')" title="Add Storage Location">
		<div class="control control-search">
			<label>Path</label>
			<input type="text" v-model="path" />
			<button @click="onBrowsePath"><icon icon="search" /> Browse</button>
			<label class="error" v-if="errors['path']">{{ errors['path'] }}</label>
		</div>
		<div class="control">
			<label>Size</label>
			<input type="text" v-model="sizeStr" />
			<label class="error" v-if="errors['size']">{{ errors['size'] }}</label>
		</div>
		<transition name="fade" appear>
			<div class="advanced" v-if="sizeValue.gte(4e12)">
				<p class="text-warning">It is recommended to create folders less than 4TB.
					Resizing or removing folders greater than 4TB can cause your host to lock up for a
					long time.</p>
				<div class="control">
					<input type="checkbox" v-model="splitFolders" id="chk-split-new-folders" />
					<label for="chk-split-new-folders">Split Folders</label>
				</div>
				<div class="control" v-if="splitFolders">
					<label>Number of Folders</label>
					<input type="number" v-model.number="splitCount" />
				</div>
			</div>
		</transition>
		<div class="controls">
			<button class="btn btn-default btn-inline" @click="$emit('close')">Cancel</button>
			<button class="btn btn-success btn-inline" @click="onCreateFolder" :disabled="!valid">Add Folder</button>
		</div>
	</modal>
</template>

<script>
import log from 'electron-log';

import Modal from '@/components/Modal';
import { BigNumber } from 'bignumber.js';
import { parseByteString } from '@/utils/parse';
import SiaApiClient from '@/api/sia';
import { refreshHostStorage } from '@/data/storage';
import { remote } from 'electron';
import { mapActions, mapState } from 'vuex';

const dialog = remote.dialog;

export default {
	components: {
		Modal
	},
	data() {
		return {
			path: '',
			sizeStr: '100 GiB',
			sizeValue: new BigNumber(0),
			errors: {},
			valid: false,
			splitFolders: false,
			creating: false
		};
	},
	computed: {
		...mapState(['config'])
	},
	methods: {
		...mapActions(['pushNotification']),
		onBrowsePath() {
			try {
				this.errors['path'] = null;

				const paths = dialog.showOpenDialog({ title: 'Path for new Storage Folder', buttonLabel: 'Select', properties: ['openDirectory'] });

				this.path = paths ? paths[0] : null;
			} catch (ex) {
				log.error('add folder browse', ex.message);
			}
		},
		async onCreateFolder() {
			if (this.creating)
				return;

			try {
				this.creating = true;
				this.validate();

				if (!this.valid)
					return;

				const client = new SiaApiClient(this.config),
					resp = await client.addStorageFolder(this.path, this.sizeValue);

				if (resp.statusCode !== 200)
					throw new Error(resp.body.message || 'Unable to create storage folder');

				await refreshHostStorage();

				this.pushNotification({
					message: 'Successfully added storage folder',
					icon: 'hdd'
				});
				this.$emit('close');
			} catch (ex) {
				log.error('add folder create', ex.message);
				this.pushNotification({
					message: ex.message,
					icon: 'hdd',
					severity: 'danger'
				});
			} finally {
				this.creating = false;
			}
		},
		validate() {
			let errors = {};

			if (!this.path || this.path.trim().length === 0)
				errors['path'] = 'Path is required';

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
		sizeStr() {
			this.validate();
		},
		path() {
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