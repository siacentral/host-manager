<template>
	<modal title="Settings" @close="$emit('close')">
		<div class="control">
			<label>Currency</label>
			<select v-model="currency">
				<option value="siacoin">Siacoin</option>
				<optgroup label="Fiat">
					<option value="usd">USD</option>
					<option value="jpy">JPY</option>
					<option value="eur">EUR</option>
					<option value="gbp">GBP</option>
					<option value="aus">AUS</option>
					<option value="cad">CAD</option>
					<option value="rub">RUB</option>
					<option value="cny">CNY</option>
				</optgroup>
				<optgroup label="Crypto">
					<option value="btc">BTC</option>
					<option value="bch">BCH</option>
					<option value="eth">ETH</option>
					<option value="xrp">XRP</option>
					<option value="ltc">LTC</option>
				</optgroup>
			</select>
		</div>
		<div class="control control-search">
			<label>Data Path</label>
			<input type="text" v-model="dataPath" />
			<button><icon icon="search"/> Browse</button>
		</div>
		<div class="control">
			<label>API Address</label>
			<input type="text" v-model="apiAddr" placeholder="localhost:9980" />
		</div>
		<div class="control">
			<label>API Agent</label>
			<input type="text" v-model="apiAgent" placeholder="Sia-Agent" />
		</div>
		<div class="control">
			<label>API Password</label>
			<input type="text" v-model="apiPassword" placeholder="automatic" />
		</div>
		<div class="controls">
			<button class="btn btn-success btn-inline" @click="onUpdateConfig">Update</button>
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
			log.error(ex.message);
		}
	},
	computed: {
		...mapState(['config'])
	},
	data() {
		return {
			currency: 'siacoin',
			apiAddr: '',
			apiAgent: '',
			apiPassword: '',
			dataPath: '',
			siaPath: ''
		};
	},
	methods: {
		...mapActions(['setConfig']),
		updateConfig() {
			this.currency = this.config.currency || 'siacoin';
			this.apiAddr = this.config.siad_api_addr;
			this.apiAgent = this.config.siad_api_agent;
			this.apiPassword = this.config.siad_api_password;
			this.dataPath = this.config.siad_data_path;
		},
		async onUpdateConfig() {
			try {
				this.setConfig({
					currency: this.currency,
					siad_api_addr: this.apiAddr,
					siad_api_agent: this.apiAgent,
					siad_api_password: this.apiPassword,
					siad_data_path: this.dataPath
				});

				await writeConfig(this.config);
				this.$emit('close');
			} catch (ex) {
				log.error(ex.message);
			}
		}
	}
};
</script>

<style lang="stylus" scoped>
	.controls {
		text-align: center;
		padding: 15px;

		&:last-child {
			margin-right: 0;
		}
	}
</style>
