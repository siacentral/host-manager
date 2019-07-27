<template>
	<modal title="Announce Host" @close="$emit('close')">
		<p>Are you sure you want to announce this host to the network?</p>
		<p>Announcing your host will change your config to accept contracts and a small
			amount of money will be deducted from your wallet for the transaction
			on the blockchain.</p>
		<p>You should only announce your host if you have not announced before, or if your IP address
			has changed.</p>
		<div class="control">
			<label>Announce address and port (leave blank for automatic)</label>
			<input type="text" v-model="announceAddress" :placeholder="configNetAddress || netAddress" />
		</div>
		<div class="controls">
			<button class="btn btn-success btn-inline" @click="onAnnounceHost" :disabled="announcing">Announce Host</button>
		</div>
	</modal>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import log from 'electron-log';

import Modal from '@/components/Modal';
import SiaApiClient from '@/api/sia';

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

				if (this.announceAddress && this.announceAddress.trim().length > 0)
					this.announceAddress = this.announceAddress.trim();
				else
					this.announceAddress = null;

				const client = new SiaApiClient(this.config),
					resp = await client.announceHost(this.announceAddress ? this.announceAddress : null);

				if (resp.statusCode !== 200)
					throw new Error(resp.body.message);

				this.pushNotification({
					message: `Successfully announced ${this.announceAddress || this.netAddress} to the network`,
					icon: 'bullhorn',
					severity: 'success'
				});

				this.$emit('close');
			} catch (ex) {
				log.error(ex.message);
				this.pushNotification({
					message: ex.message,
					icon: 'bullhorn',
					severity: 'danger'
				});
			} finally {
				this.announcing = false;
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
