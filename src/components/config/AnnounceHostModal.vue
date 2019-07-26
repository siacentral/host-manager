<template>
	<modal title="Announce Host" @close="$emit('close')">
		<p>Are you sure you want to announce this host to the network?</p>
		<p>Announcing your host will change your config to accept contracts and a small
			amount of money will be deducted from your wallet for the transaction
			on the blockchain.</p>
		<p>You should only announce your host if you have not announced before, or if your IP address
			has changed.</p>
		<div class="control">
			<label>Announce Address and port</label>
			<input type="text" v-model="announceAddress" :placeholder="configNetAddress || netAddress" />
		</div>
		<div class="controls">
			<button class="btn btn-success btn-inline" @click="onAnnounceHost">Announce Host</button>
		</div>
	</modal>
</template>

<script>
import Modal from '@/components/Modal';
import { mapState, mapActions } from 'vuex';
import log from 'electron-log';

export default {
	components: {
		Modal
	},
	computed: {
		...mapState({
			configNetAddress: state => state.hostConfig.netaddress,
			netAddress: state => state.netAddress
		})
	},
	data() {
		return {
			announceAddress: null,
			announcing: false
		};
	},
	methods: {
		...mapActions(['pushNotification']),
		async onAnnounceHost() {
			if (this.announcing)
				return;

			try {
				this.announcing = true;

				this.pushNotification({
					message: 'Not yet implemented sorry!',
					icon: 'bullhorn',
					severity: 'warning'
				});
				this.$emit('close');
			} catch (ex) {
				log.error(ex.message);
			} finally {
				this.announce = false;
			}
		}
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
