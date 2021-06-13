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
					long time. You can split them into equally sized subdirectories in your target folder for easier management.</p>
				<div class="control">
					<input type="checkbox" v-model="splitFolders" id="chk-split-new-folders" />
					<label for="chk-split-new-folders">Split Folders</label>
				</div>
				<div class="control" v-if="splitFolders">
					<label>Subdirectory Name</label>
					<input type="text" v-model="subName" />
					<label class="error" v-if="errors['subdirectory']">{{ errors['subdirectory'] }}</label>
				</div>
				<div class="control" v-if="splitFolders">
					<label>Number of Folders</label>
					<input type="number" min="1" increment="1" v-model.number="splitCount" />
					<label class="error" v-if="errors['splitcount']">{{ errors['splitcount'] }}</label>
				</div>
				<progress-bar :progress="createdCount / splitCount" v-if="splitFolders && creating" />
			</div>
		</transition>
		<p v-if="valid">{{ creationText }}</p>
		<div class="controls">
			<button class="btn btn-default btn-inline" @click="$emit('close')">Cancel</button>
			<button class="btn btn-success btn-inline" @click="onCreateFolder" :disabled="!valid || creating">Add Folder</button>
		</div>
	</modal>
</template>

<script>
import log from 'electron-log';
import path from 'path';
import { BigNumber } from 'bignumber.js';
import { mapActions, mapState } from 'vuex';
import { remote } from 'electron';

import { mkdirIfNotExist } from '@/utils';
import { parseByteString } from '@/utils/parseLegacy';
import { formatByteString } from '@/utils/formatLegacy';
import SiaApiClient from '@/api/sia';
import { refreshHostStorage } from '@/sync/storage';
import ProgressBar from '@/components/ProgressBar';
import Modal from '@/components/Modal';

const dialog = remote.dialog;

const sectorSize = 1 << 22,
	minSectors = 1 << 6,
	granularity = 64,
	minStorageSize = Math.floor(minSectors * sectorSize / granularity) * granularity,
	minSizeStr = formatByteString(minStorageSize);

export default {
	components: {
		Modal,
		ProgressBar
	},
	data() {
		return {
			path: '',
			sizeStr: '100 GiB',
			sizeValue: new BigNumber(0),
			errors: {},
			valid: false,
			splitFolders: false,
			splitCount: 1,
			createdCount: 0,
			subName: '',
			creating: false
		};
	},
	mounted() {
		if (this.config.data_unit === 'decimal')
			this.sizeStr = '100 GB';
	},
	computed: {
		...mapState(['config']),
		creationText() {
			const folderSize = this.sizeValue.div(this.splitFolders ? this.splitCount : 1),
				actualSize = new BigNumber(Math.floor(folderSize.div(sectorSize * granularity)
					.toNumber())).times(sectorSize * granularity);

			return `Adding ${this.splitFolders && this.splitCount > 1 ? this.splitCount + ' folders' : '1 folder'} of size ${formatByteString(actualSize, 2)}`;
		}
	},
	methods: {
		...mapActions(['pushNotification']),
		async onBrowsePath() {
			try {
				this.errors['path'] = null;

				const fp = await dialog.showOpenDialog({ title: 'Path for new Storage Folder', buttonLabel: 'Select', properties: ['openDirectory'] });

				if (!fp || !Array.isArray(fp.filePaths) || fp.filePaths.length === 0)
					return;

				this.path = fp.filePaths[0];
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

				this.createdCount = 0;

				if (this.splitFolders) {
					const size = this.sizeValue.div(this.splitCount);

					for (let i = 1; i < this.splitCount + 1; i++) {
						const subPath = path.join(this.path, `${this.subName}${i}`);

						await this.createFolder(subPath, size);

						this.createdCount++;
					}
				} else
					await this.createFolder(this.path, this.sizeValue);

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
		async createFolder(path, size) {
			await mkdirIfNotExist(path);

			// all folders must be a factor of 64 sectors
			size = new BigNumber(Math.floor(size.div(sectorSize * granularity).toNumber())).times(sectorSize * granularity);

			const client = new SiaApiClient(this.config);

			await client.addStorageFolder(path, size);
		},
		validate() {
			let errors = {};

			if (!this.path || this.path.trim().length === 0)
				errors['path'] = 'Path is required';

			try {
				this.sizeValue = parseByteString(this.sizeStr);

				if (!this.sizeValue || this.sizeValue.eq(0))
					errors['size'] = 'Size must be greater than 0';

				if (this.sizeValue.lte(minStorageSize))
					errors['size'] = `Size must be greater than ${minSizeStr}`;
			} catch (ex) {
				errors['size'] = ex.message;
			}

			if (this.splitFolders) {
				if (!this.subName || this.subName.trim().length === 0)
					errors['subdirectory'] = 'Name is required';

				if (this.splitCount <= 0)
					errors['splitcount'] = 'Must be greater than 0';
				else if (this.sizeValue.div(this.splitCount).lte(minStorageSize)) {
					const maxSplit = Math.floor(this.sizeValue.div(minStorageSize).toNumber());

					errors['splitcount'] = `Split count must be less than ${maxSplit}`;
				}
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
		},
		subName() {
			this.validate();
		},
		splitCount() {
			this.validate();
		},
		splitFolders() {
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