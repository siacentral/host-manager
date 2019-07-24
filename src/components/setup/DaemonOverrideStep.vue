<template>
	<setup-step>
		<template v-slot:info>
			<div class="setup-icon">
				<icon icon="cogs" />
			</div>
			<h3>Do you want to change ports?</h3>
			<p>Some hosts change the port their host listens on, use a custom RPC port, or change their API authentication. Change any of the daemon settings you need to. Leave blank to use the default value.</p>
		</template>
		<div class="control">
			<label>Host Port</label>
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
		<template v-slot:controls>
			<button class="btn btn-inline" @click="onNext(-1)">Previous</button>
			<button class="btn btn-success btn-inline" @click="onNext(1)">Next</button>
		</template>
	</setup-step>
</template>

<script>
import SetupStep from './SetupStep';

export default {
	name: 'daemon-overide-step',
	components: {
		SetupStep
	},
	props: {
		config: Object
	},
	mounted() {
		this.userAgent = this.config.siad_api_agent;
		this.hostPort = this.config.siad_host_port;
		this.rpcPort = this.config.siad_rpc_port;
		this.apiAddr = this.config.siad_api_addr;
	},
	data() {
		return {
			userAgent: null,
			hostPort: null,
			rpcPort: null,
			apiAddr: null
		};
	},
	methods: {
		onNext(n) {
			this.$emit('done', {
				inc: n,
				config: {
					'siad_api_agent': this.userAgent,
					'siad_host_port': this.hostPort,
					'siad_rpc_port': this.rpcPort,
					'siad_api_addr': this.apiAddr
				}
			});
		}
	}
};
</script>
