<template>
	<modal title="Announce Host" @close="$emit('close')">
		<p>Are you sure you want to announce this host to the network?</p>
		<p>Announcing your host will deduct a small amount of Siacoin from your wallet for the transaction
			on the blockchain.</p>
		<p class="text-warning" v-if="lastAnnouncement">You should only announce again if your IP address
			has changed or you are having trouble getting new contracts. Your last confirmed announcement was <i>{{ lastAnnouncement.net_address }}</i> on {{ lastAnnouncement.date }}</p>
		<div class="control control-mode">
			<label>Announce address and port</label>
			<select v-model="addressMode">
				<option value="automatic">Automatic</option>
				<option value="custom">Custom</option>
			</select>
			<transition name="fade" mode="out-in">
				<input type="text" :key="addressMode" v-model="announceAddress" :readonly="addressMode !== 'custom'" />
			</transition>
			<transition name="fade" mode="out-in" appear>
				<label class="error" v-if="error">{{ error }}</label>
			</transition>
		</div>
		<div class="controls">
			<button class="btn btn-success btn-inline" @click="onAnnounceHost" :disabled="announcing || error">Announce Host</button>
		</div>
	</modal>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import log from 'electron-log';

import Modal from '@/components/Modal';
import SiaApiClient from '@/api/sia';
import { formatShortDateString } from '@/utils/formatLegacy';

export default {
	components: {
		Modal
	},
	computed: {
		...mapState({
			configNetAddress: state => state.hostConfig.config.netaddress,
			netAddress: state => state.netAddress,
			host: state => state.explorer.host
		}),
		lastAnnouncement() {
			if (!Array.isArray(this.host.announcements) || this.host.announcements.length === 0)
				return null;

			const lastAnnounce = this.host.announcements[this.host.announcements.length - 1];

			return {
				date: formatShortDateString(new Date(lastAnnounce.timestamp)),
				net_address: lastAnnounce.net_address
			};
		}
	},
	beforeMount() {
		if (this.configNetAddress && this.configNetAddress.trim().length > 0)
			this.addressMode = 'custom';
		else
			this.addressMode = 'automatic';
	},
	data() {
		return {
			announceAddress: null,
			announcing: false,
			addressMode: null,
			error: null
		};
	},
	methods: {
		...mapActions(['pushNotification']),
		validateAddress(netaddress) {
			try {
				if (this.addressMode === 'automatic') {
					this.error = null;
					return;
				}

				const i = netaddress.lastIndexOf(':');

				if (i < 0)
					throw new Error('net address is missing port');

				const port = netaddress.substr(i + 1),
					addr = netaddress.substr(0, i);

				if (addr.length === 0 || addr.search(/\s+/gm) !== -1)
					throw new Error('net address cannot contain spaces');

				if (port.length === 0 || port.search(/\s+/gm) !== -1)
					throw new Error('port cannot contain spaces');

				// parseFloat to preserve any decimals isInteger will return false when decimals are present
				if (!Number.isInteger(parseFloat(port)))
					throw new Error('port must be a number between 0 and 65535');

				if (port < 0 || port > 65535)
					throw new Error('port must be a number between 0 and 65535');

				this.error = null;
			} catch (ex) {
				this.error = ex.message;
			}
		},
		async onAnnounceHost() {
			if (this.announcing)
				return;

			try {
				this.announcing = true;

				let hostConfig = {
						acceptingcontracts: true
					},
					address = null;

				switch (this.addressMode.toLowerCase()) {
				case 'automatic':
					hostConfig.netaddress = '';
					address = null;
					break;
				case 'custom':
					hostConfig.netaddress = this.announceAddress;
					address = this.announceAddress;
					break;
				default:
					throw new Error('unknown announce type');
				}

				const client = new SiaApiClient(this.config);

				await client.updateHost(hostConfig);
				await client.announceHost(address);

				this.pushNotification({
					message: `Successfully announced to the network`,
					icon: 'bullhorn',
					severity: 'success'
				});

				this.$emit('close');
			} catch (ex) {
				log.error('announce host', ex.message);
				this.error = ex.message;
				this.pushNotification({
					message: ex.message,
					icon: 'bullhorn',
					severity: 'danger'
				});
			} finally {
				this.announcing = false;
			}
		}
	},
	watch: {
		addressMode(mode) {
			switch (mode.toLowerCase()) {
			case 'automatic':
				this.announceAddress = 'automatic';
				break;
			case 'custom':
				if (this.configNetAddress.trim().length === 0)
					this.announceAddress = this.netAddress;
				else
					this.announceAddress = this.configNetAddress;

				break;
			}
		},
		announceAddress(address) {
			this.validateAddress(address);
		}
	}
};
</script>

<style lang="stylus" scoped>
	.control-mode {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		grid-gap: 5px;

		label {
			grid-column: auto / span 2;
		}

		input:read-only {
			color: rgba(255, 255, 255, 0.54);
		}
	}

	.controls {
		padding: 15px 15px 0;
		text-align: center;

		&:last-child {
			margin-right: 0;
		}
	}

	.text-warning {
		color: warning-accent;
	}
</style>
