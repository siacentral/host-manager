<template>
	<setup-step>
		<template v-slot:info>
			<div class="setup-icon">
				<icon :con="unlock" />
			</div>
			<h3>Is Your Wallet Setup to Automatically Unlock?</h3>
			<p>To host on the Sia network and form contracts your wallet needs to be unlocked while your Daemon is running.
				Most hosts set up their wallet to auto unlock by adding the <span class="text-primary">"SIA_WALLET_PASSWORD"</span> environment variable.
				SiaCentral can automatically unlock your wallet on start up instead.</p>
		</template>
		<div class="control">
			<label>Password to Automatically Unlock Wallet</label>
			<input type="password" v-model="walletPassword" />
		</div>
		<template v-slot:controls>
			<button class="btn btn-inline" @click="onNext(-1)">Previous</button>
			<button class="btn btn-success btn-inline" @click="onNext(1)">Skip</button>
			<button class="btn btn-success btn-inline" @click="onNext(1)" :disabled="!walletPassword">Next</button>
		</template>
	</setup-step>
</template>

<script>
import SetupStep from './SetupStep';

export default {
	name: 'auto-unlock-step',
	components: {
		SetupStep
	},
	props: {
		config: Object
	},
	data() {
		return {
			walletPassword: null
		};
	},
	mounted() {
		this.walletPassword = this.config.siad_wallet_password || '';
	},
	methods: {
		onNext(n) {
			this.$emit('done', {
				inc: n,
				config: {
					siad_wallet_password: this.walletPassword
				}
			});
		}
	}
};
</script>
