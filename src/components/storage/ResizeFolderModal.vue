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
import Modal from '@/components/Modal';
import { BigNumber } from 'bignumber.js';
import { formatByteString } from '@/utils/format';
import { parseByteString } from '@/utils/parse';

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
			valid: true
		};
	},
	beforeMount() {
		try {
			this.sizeValue = this.folder.total_capacity;
			this.sizeStr = formatByteString(this.folder.total_capacity, 2);
		} catch (ex) {
			console.log(ex);
		}
	},
	methods: {
		onResizeFolder() {
			try {
				this.validate();

				if (!this.valid)
					return;
			} catch (ex) {
				console.log(ex);
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