<template>
	<modal @close="$emit('close')" title="Remove Storage Location">
		<p>Are you sure you want to remove the storage location at <span class="storage-location">{{ folder.path }}</span>?</p>
		<p>Your host will lose {{ formatByteString(folder.total_capacity, 2) }} of storage. <span v-if="folder.used_capacity > 0">This will attempt
			to relocate the {{ formatByteString(folder.used_capacity, 2) }} of data stored to a different folder. If there is not enough
			space available removal will fail.</span></p>
		<p>On large folders or slow disks your host may become inaccessible during removal. It is not recommended
				to remove or resize folders when contracts are about to expire.</p>
		<p>Type <span class="storage-location">{{ folder.path }}</span> in the box below to remove the storage folder</p>
		<div class="control">
			<label>Path</label>
			<input type="text" v-model="validateName"/>
		</div>
		<div class="control">
			<input type="checkbox" v-model="forceDelete" id="chk-force-delete" />
			<label for="chk-force-delete">Force</label>
		</div>
		<p v-if="forceDelete" class="error">Force deleting a folder will delete the folder even if the data cannot be relocated.
			This will cause data loss and contract failure for any data that is stored on this
			folder. Use this as a last resort only.</p>
		<div class="controls">
			<button class="btn btn-default btn-inline" @click="$emit('close')">Cancel</button>
			<button class="btn btn-danger btn-inline" @click="onRemoveFolder" :disabled="validateName !== folder.path || removing">Remove Folder</button>
		</div>
	</modal>
</template>

<script>
import Modal from '@/components/Modal';
import { formatByteString } from '@/utils/format';
import { removeStorageFolder } from '@/utils/sia';

export default {
	components: {
		Modal
	},
	props: {
		folder: Object
	},
	data() {
		return {
			validateName: '',
			forceDelete: false,
			removing: false
		};
	},
	methods: {
		formatByteString,
		async onRemoveFolder() {
			if (this.removing)
				return;

			try {
				if (this.validateName !== this.folder.path)
					return;

				console.log('removing');

				const resp = await removeStorageFolder(this.folder.path, this.forceDelete);

				if (resp.statusCode !== 200)
					throw new Error(resp.body.message);

				console.log(resp);

				this.$emit('close');
			} catch (ex) {
				console.log(ex);
			} finally {
				this.removing = false;
			}
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

.control {
	margin-bottom: 10px;
}

.error {
	color: negative-accent;
}
</style>