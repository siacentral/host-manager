<template>
	<setup-step>
		<template v-slot:info>
			<div class="setup-icon">
				<icon icon="cogs" />
			</div>
			<h3>Do you want to change any Daemon flags?</h3>
			<p>Some hosts use custom ports or change their API authentication. Change any of the daemon settings you need to. Leave blank to use the default value.</p>
		</template>
		<div class="control">
			<label>RHP3 Websocket Port</label>
			<input type="text" v-model="siaMuxWSPort" placeholder=":9984" />
		</div>
		<div class="control">
			<label>RHP3 Port</label>
			<input type="text" v-model="siaMuxPort" placeholder=":9983" />
		</div>
		<div class="control">
			<label>RHP2 Port</label>
			<input type="text" v-model="hostPort" placeholder=":9982" />
		</div>
		<div class="control">
			<label>RPC Port</label>
			<input type="text" v-model="rpcPort" placeholder=":9981" />
		</div>
		<div class="control">
			<label>API Listen Address</label>
			<input type="text" v-model="apiAddr" placeholder="localhost:9980" />
		</div>
		<div class="control">
			<label>API User Agent</label>
			<input type="text" v-model="userAgent" placeholder="Sia-Agent" />
		</div>
		<div class="control">
			<label>API Password</label>
			<input type="text" v-model="apiPassword" placeholder="automatic" />
		</div>
		<template v-slot:controls>
			<button class="btn btn-inline" @click="onNext(-1)">Previous</button>
			<button class="btn btn-success btn-inline" @click="onNext(1)">Next</button>
		</template>
	</setup-step>
</template>

<script>
import SetupStep from './SetupStep';

export default {
	components: {
		SetupStep
	},
	props: {
		config: Object
	},
	mounted() {
		this.userAgent = this.config.siad_api_agent;
		this.hostPort = this.config.siad_host_port;
		this.siaMuxPort = this.config.siad_siamux_port;
		this.siaMuxWSPort = this.config.siad_siamux_ws_port;
		this.rpcPort = this.config.siad_rpc_port;
		this.apiAddr = this.config.siad_api_addr;
	},
	data() {
		return {
			userAgent: null,
			hostPort: null,
			siaMuxPort: null,
			siaMuxWSPort: null,
			rpcPort: null,
			apiAddr: null,
			apiPassword: null
		};
	},
	methods: {
		onNext(n) {
			this.$emit('done', {
				inc: n,
				config: {
					'siad_api_agent': this.userAgent,
					'siad_host_port': this.hostPort,
					'siad_siamux_port': this.siaMuxPort,
					'siad_siamux_wx_port': this.siaMuxWSPort,
					'siad_rpc_port': this.rpcPort,
					'siad_api_addr': this.apiAddr,
					'siad_api_password': this.apiPassword
				}
			});
		}
	}
};
</script>
