<template>
	<modal title="Announce Host" @close="$emit('close')">
		<p>Are you sure you want to announce this host to the network?</p>
		<p>Announcing your host will change your config to accept contracts and a small
			amount of money will be deducted from your wallet for the transaction
			on the blockchain.</p>
		<p>You should only announce your host if you have not announced before, or if your IP address
			has changed.</p>
		<div class="control">
			<input type="checkbox" v-model="useCustom" id="chk-custom-announce" />
			<label for="chk-custom-announce">Custom Announce Address</label>
		</div>
		<div class="control" v-if="useCustom">
			<label>Announce Address</label>
			<input type="text" v-model="announceAddress" />
		</div>
		<div class="controls">
			<button class="btn btn-success btn-inline">Announce Host</button>
		</div>
	</modal>
</template>

<script>
import Modal from '@/components/Modal';

export default {
	components: {
		Modal
	},
	data() {
		return {
			useCustom: false,
			announceAddress: ''
		};
	}
};
</script>

<style lang="stylus" scoped>
	.controls {
		padding: 15px 15px 0;
		text-align: center;

		&:last-child {
			margin-right: 0;
		}
	}
</style>
