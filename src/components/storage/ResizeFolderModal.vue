<template>
	<modal @close="$emit('close')" title="Resize Storage Location">
		<div class="control">
			<label>Path</label>
			<input type="text" v-model="folder.path" readonly/>
		</div>
		<div class="control">
			<label>New Size</label>
			<input type="text" v-model="sizeStr" />
			<label class="error" v-if="errors['size']">{{ errors['size'] }}</label>
		</div>
		<div class="controls">
			<button class="btn btn-default btn-inline" @click="$emit('close')">Cancel</button>
			<button class="btn btn-success btn-inline" @click="onResizeFolder" :disabled="!valid">Resize Folder</button>
		</div>
	</modal>
</template>

<script>
import log from 'electron-log';

import Modal from '@/components/Modal';
import { BigNumber } from 'bignumber.js';
import { formatByteString } from '@/utils/formatLegacy';
import { parseByteString } from '@/utils/parse';
import { mapActions, mapState } from 'vuex';
import { refreshHostStorage } from '@/sync/storage';
import SiaApiClient from '@/api/sia';

export default {
	components: {
		Modal
	},
	props: {
		folder: Object
	},
	data() {
		return {
			sizeStr: '100 GB',
			sizeValue: new BigNumber(0),
			errors: {},
			valid: true,
			resizing: false
		};
	},
	beforeMount() {
		try {
			this.sizeValue = this.folder.total_capacity;
			this.sizeStr = formatByteString(this.folder.total_capacity, 2);
		} catch (ex) {
			log.error('resize folder beforeMount', ex.message);
		}
	},
	computed: {
		...mapState(['config'])
	},
	methods: {
		...mapActions(['pushNotification']),
		async onResizeFolder() {
			if (this.resizing)
				return;

			try {
				this.resizing = true;
				this.validate();

				if (!this.valid)
					return;

				const client = new SiaApiClient(this.config);

				await client.resizeStorageFolder(this.folder.path, this.sizeValue);
				await refreshHostStorage();

				this.pushNotification({
					message: 'Folder is being resized. This can take some time.',
					icon: 'hdd'
				});
				this.$emit('close');
			} catch (ex) {
				log.error('resize folder', ex.message);
				this.pushNotification({
					message: ex.message,
					icon: 'hdd',
					severity: 'danger'
				});
			} finally {
				this.resizing = false;
			}
		},
		validate() {
			let errors = {};

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