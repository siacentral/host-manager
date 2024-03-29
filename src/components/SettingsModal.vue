<template>
	<modal title="Settings" @close="$emit('close')">
		<div class="settings-modal">
			<div class="settings-wrapper">
				<div class="settings-controls">
					<div class="settings-section text-small text-success">App Settings</div>
					<div class="control">
						<label>Currency</label>
						<select v-model="currency">
							<optgroup label="Fiat">
								<option value="usd">USD</option>
								<option value="eur">EUR</option>
								<option value="jpy">JPY</option>
								<option value="cny">CNY</option>
								<option value="cad">CAD</option>
								<option value="gbp">GBP</option>
								<option value="rub">RUB</option>
							</optgroup>
							<optgroup label="Crypto">
								<option value="btc">BTC</option>
								<option value="eth">ETH</option>
							</optgroup>
						</select>
						<transition name="fade" mode="out-in" appear>
							<label class="error" v-if="errors['currency']">{{ errors['currency'] }}</label>
						</transition>
					</div>
					<div class="control">
						<label>Data Unit</label>
						<select v-model="dataUnit">
							<option value="binary">Binary (1 TiB = 1024 GiB)</option>
							<option value="decimal">Decimal (1 TB = 1000 GB)</option>
						</select>
						<transition name="fade" mode="out-in" appear>
							<label class="error" v-if="errors['currency']">{{ errors['currency'] }}</label>
						</transition>
					</div>
					<div class="control">
						<label>Update Channel</label>
						<select v-model="updateChannel">
							<option value="latest">Stable</option>
							<option value="beta">Beta</option>
							<option value="alpha">Alpha</option>
						</select>
						<transition name="fade" mode="out-in" appear>
							<label class="error" v-if="errors['updateChannel']">{{ errors['updateChannel'] }}</label>
						</transition>
					</div>
					<div class="settings-section text-small text-success">Daemon Settings</div>
					<div class="control control-search">
						<label>Data Path</label>
						<input type="text" v-model="dataPath" />
						<button><icon icon="search"/> Browse</button>
						<transition name="fade" mode="out-in" appear>
							<label class="error" v-if="errors['dataPath']">{{ errors['dataPath'] }}</label>
						</transition>
					</div>
					<div class="control">
						<label>RPC Port</label>
						<input type="text" v-model="rpcPort" placeholder=":9981" />
						<transition name="fade" mode="out-in" appear>
							<label class="error" v-if="errors['rpcPort']">{{ errors['rpcPort'] }}</label>
						</transition>
					</div>
					<div class="control">
						<label>Host Port</label>
						<input type="text" v-model="hostPort" placeholder=":9982" />
						<transition name="fade" mode="out-in" appear>
							<label class="error" v-if="errors['hostPort']">{{ errors['hostPort'] }}</label>
						</transition>
					</div>
					<div class="control">
						<label>SiaMux Port</label>
						<input type="text" v-model="siaMuxPort" placeholder=":9983" />
						<transition name="fade" mode="out-in" appear>
							<label class="error" v-if="errors['siaMuxPort']">{{ errors['siaMuxPort'] }}</label>
						</transition>
					</div>
					<div class="control">
						<label>SiaMux WebSocket Port</label>
						<input type="text" v-model="siaMuxWSPort" placeholder=":9984" />
						<transition name="fade" mode="out-in" appear>
							<label class="error" v-if="errors['siaMuxWSPort']">{{ errors['siaMuxWSPort'] }}</label>
						</transition>
					</div>
					<div class="control">
						<label>API Address</label>
						<input type="text" v-model="apiAddr" placeholder="localhost:9980" />
						<transition name="fade" mode="out-in" appear>
							<label class="error" v-if="errors['apiAddr']">{{ errors['apiAddr'] }}</label>
						</transition>
					</div>
					<div class="control">
						<label>API Agent</label>
						<input type="text" v-model="apiAgent" placeholder="Sia-Agent" />
						<transition name="fade" mode="out-in" appear>
							<label class="error" v-if="errors['apiAgent']">{{ errors['apiAgent'] }}</label>
						</transition>
					</div>
					<div class="control">
						<label>API Password</label>
						<input type="text" v-model="apiPassword" placeholder="automatic" />
						<transition name="fade" mode="out-in" appear>
							<label class="error" v-if="errors['apiPassword']">{{ errors['apiPassword'] }}</label>
						</transition>
					</div>
				</div>
			</div>
			<transition name="fade" mode="out-in" appear>
				<div class="text-small text-warning" v-if="notice" :key="notice">{{ notice }}</div>
			</transition>
			<div class="controls">
				<button class="btn btn-success btn-inline" @click="onUpdateConfig" :disabled="!changed || !valid">Update</button>
			</div>
		</div>
	</modal>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { writeConfig } from '@/utils';
import log from 'electron-log';

import Modal from '@/components/Modal';

export default {
	components: {
		Modal
	},
	beforeMount() {
		try {
			this.updateConfig();
		} catch (ex) {
			log.error('settings beforeMount', ex.message);
		}
	},
	computed: {
		...mapState(['config'])
	},
	data() {
		return {
			currency: 'usd',
			dataUnit: 'decimal',
			updateChannel: 'latest',
			apiAddr: '',
			apiAgent: '',
			apiPassword: '',
			dataPath: '',
			hostPort: '',
			siaMuxPort: '',
			siaMuxWSPort: '',
			rpcPort: '',
			notice: null,
			errors: {},
			valid: false,
			changed: false
		};
	},
	methods: {
		...mapActions(['setConfig']),
		validate() {
			const portRegex = /^:(?<port>[0-9]{1,5})$/mi,
				listenRegex = /^(?<address>\S+):(?<port>[0-9]{1,5})$/mi;

			const errors = {};
			let hasErrors = false;

			if (this.hostPort && this.hostPort.length > 0 && portRegex.exec(this.hostPort) === null) {
				errors.hostPort = 'host port must match the format :9982';
				hasErrors = true;
			}

			if (this.siaMuxWSPort && this.siaMuxWSPort.length > 0 && portRegex.exec(this.siaMuxWSPort) === null) {
				errors.siaMuxWSPort = 'SiaMux port must match the format :9984';
				hasErrors = true;
			}

			if (this.siaMuxPort && this.siaMuxPort.length > 0 && portRegex.exec(this.siaMuxPort) === null) {
				errors.siaMuxPort = 'SiaMux port must match the format :9983';
				hasErrors = true;
			}

			if (this.rpcPort && this.rpcPort.length > 0 && portRegex.exec(this.rpcPort) === null) {
				errors.rpcPort = 'RPC port must match the format :9981';
				hasErrors = true;
			}

			if (this.apiAddr && this.apiAddr.length > 0 && listenRegex.exec(this.apiAddr) === null) {
				errors.apiAddr = 'API Address must match the format localhost:9980';
				hasErrors = true;
			}

			this.errors = errors;
			this.valid = !hasErrors;
		},
		checkChannel(channel) {
			channel = channel?.toLowerCase() || 'latest';
			const validChannels = ['latest', 'beta', 'alpha'];
			return validChannels.indexOf(channel) === -1 ? 'latest' : channel;
		},
		updateConfig() {
			this.currency = this.config.currency || 'usd';
			this.updateChannel = this.checkChannel(this.config.updateChannel);
			this.dataUnit = this.config.data_unit || 'decimal';
			this.apiAddr = this.config.siad_api_addr;
			this.apiAgent = this.config.siad_api_agent;
			this.apiPassword = this.config.siad_api_password;
			this.dataPath = this.config.siad_data_path;
			this.siaMuxPort = this.config.siad_siamux_port;
			this.siaMuxWSPort = this.config.siad_siamux_ws_port;
			this.hostPort = this.config.siad_host_port;
			this.rpcPort = this.config.siad_rpc_port;
		},
		async onUpdateConfig() {
			try {
				const newConfig = {
					...this.config,
					currency: this.currency,
					updateChannel: this.updateChannel,
					data_unit: this.dataUnit,
					siad_api_addr: this.apiAddr,
					siad_api_agent: this.apiAgent,
					siad_api_password: this.apiPassword,
					siad_data_path: this.dataPath,
					siad_siamux_port: this.siaMuxPort,
					siad_siamux_ws_port: this.siaMuxWSPort,
					siad_host_port: this.hostPort,
					siad_rpc_port: this.rpcPort
				};

				this.setConfig(newConfig);
				await writeConfig(newConfig);
				this.$emit('close');
			} catch (ex) {
				log.error('settings update', ex.message);
			}
		}
	},
	watch: {
		currency(val) {
			this.validate();

			if (this.changed)
				return;

			this.changed = (val !== this.config.currency);
		},
		updateChannel(val) {
			this.validate();

			if (this.changed)
				return;

			this.changed = (val !== this.config.updateChannel);
		},
		dataUnit(val) {
			this.validate();

			if (this.changed)
				return;

			this.changed = (val !== this.config.data_unit);
		},
		apiAddr(val) {
			this.validate();

			if (this.changed)
				return;

			this.changed = (val !== this.config.siad_api_addr);

			if (this.changed)
				this.notice = 'Changes will not take effect until daemon restart.';
		},
		apiAgent(val) {
			this.validate();

			if (this.changed)
				return;

			this.changed = (val !== this.config.siad_api_agent);

			if (this.changed)
				this.notice = 'Changes will not take effect until daemon restart.';
		},
		apiPassword(val) {
			this.validate();

			if (this.changed)
				return;

			this.changed = (val !== this.config.siad_api_password);

			if (this.changed)
				this.notice = 'Changes will not take effect until daemon restart.';
		},
		dataPath(val) {
			this.validate();

			if (this.changed)
				return;

			this.changed = (val !== this.config.siad_data_path);

			if (this.changed)
				this.notice = 'Changes will not take effect until daemon restart.';
		},
		siaMuxPort(val) {
			this.validate();

			if (this.changed)
				return;

			this.changed = (val !== this.config.siad_siamux_port);

			if (this.changed)
				this.notice = 'Changes will not take effect until daemon restart.';
		},
		hostPort(val) {
			this.validate();

			if (this.changed)
				return;

			this.changed = (val !== this.config.siad_host_port);

			if (this.changed)
				this.notice = 'Changes will not take effect until daemon restart.';
		},
		rpcPort(val) {
			this.validate();

			if (this.changed)
				return;

			this.changed = (val !== this.config.siad_rpc_port);

			if (this.changed)
				this.notice = 'Changes will not take effect until daemon restart.';
		}
	}
};
</script>

<style lang="stylus" scoped>
.settings-section {
	margin-bottom: 15px;
}

.settings-modal {
	display: grid;
	grid-template-rows: minmax(0, 1fr) auto;
	height: 100%;
	width: 100%;
	overflow: hidden;
	grid-gap: 15px;

	.settings-wrapper {
		height: 100%;
		overflow: auto;
	}

	.settings-controls {
		height: auto;
		overflow: auto;
	}
}

.controls {
	text-align: center;
	padding: 15px;

	&:last-child {
		margin-right: 0;
	}
}
</style>
