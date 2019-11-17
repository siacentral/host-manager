<template>
	<div :class="{ 'create-wallet': true, 'wallet-error': error }">
		<div class="create-wallet-info">
			<div class="create-wallet-icon">
				<icon icon="wallet" />
			</div>
			<h3>Wallet is locked</h3>
			<p>Host wallets always need to be unlocked to form new contracts and submit storage proofs.
				Enter your encryption password below to unlock your wallet. Sia Host Manager can handle
				this automatically in the future.</p>
			<div class="wallet-step">
				<div class="control">
					<label>Encryption Password</label>
					<input type="password" v-model="password" />
					<label class="error" v-if="error">{{ error }}</label>
				</div>
				<div class="control">
					<input type="checkbox" v-model="autoUnlock" id="chk-auto-unlock-setup" />
					<label for="chk-auto-unlock-setup">Automatically Unlock Wallet</label>
				</div>
				<div class="buttons">
					<button class="btn btn-success btn-inline" :disabled="unlocking" @click="onUnlock">Unlock</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import { writeConfig } from '@/utils';
import SiaApiClient from '@/sia/api';
import { refreshHostWallet } from '@/sync/wallet';

export default {
	data() {
		return {
			autoUnlock: false,
			password: null,
			unlocking: false,
			error: null
		};
	},
	computed: {
		...mapState(['config'])
	},
	methods: {
		...mapActions(['pushNotification', 'setConfig']),
		async onUnlock() {
			if (this.unlocking)
				return;

			try {
				this.unlocking = true;

				if (!this.password || this.password.trim().length === 0) {
					this.error = 'Unlock password is required';
					return;
				}

				if (this.autoUnlock) {
					const newConf = { ...this.config, siad_wallet_password: this.password };

					this.setConfig(newConf);
					await writeConfig(newConf);
				}

				const client = new SiaApiClient(this.config);

				await client.unlockWallet(this.password);

				refreshHostWallet();
			} catch (ex) {
				this.error = ex.message;
			} finally {
				this.unlocking = false;
			}
		}
	}
};
</script>

<style lang="stylus" scoped>
.create-wallet {
	position: fixed;
	display: grid;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	grid-template-rows: auto;
	grid-template-columns: 100%;
	align-items: center;
	justify-content: center;
	background-color: bg-dark;
	background-image: linear-gradient(225deg, bg-dark-accent 0%, bg-dark 100%);
	z-index: 999;

	.wallet-step, .buttons {
		padding: 15px;
		text-align: left;

		> .buttons {
			padding: 0;
		}

		&.buttons {
			text-align: center;
		}

		&:last-child {
			margin-right: 0;
		}
	}

	.create-wallet-icon.create-wallet-icon {
		color: primary;
		margin: 0 auto 30px;

		svg {
			display: block;
			width: auto;
			height: 80px;
			margin: 0 auto;
		}
	}

	h1, h3 {
		text-align: center;
		color: primary;
		margin: 0 0 25px;
	}

	&.wallet-error {
		p {
			color: negative-accent;
		}
	}

	p {
		width: 100%;
		margin: 0 0 10px;
		color: rgba(255, 255, 255, 0.54);
	}

	.create-wallet-info {
		width: 100%;
		margin: auto;
		padding: 30px 10vw;
		text-align: center;
	}
}

body.dark {
	p {
		color: rgba(255, 255, 255, 0.54);
	}
}
</style>
