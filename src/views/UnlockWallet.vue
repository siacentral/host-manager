<template>
	<div :class="{ 'create-wallet': true, 'wallet-error': error }">
		<div class="create-wallet-info">
			<div class="create-wallet-icon">
				<icon icon="wallet" />
			</div>
			<h3>Wallet is locked</h3>
			<p>Host wallets always need to be unlocked to form new contracts and submit storage proofs.
				Enter your encryption password below to unlock your wallet.</p>
			<div class="wallet-step">
				<div class="control">
					<label>Encryption Password</label>
					<input type="text" v-model="password" />
					<label class="error" v-if="error">{{ error }}</label>
				</div>
				<div class="buttons">
					<button class="btn btn-success btn-inline" :disabled="unlocking" @click="onUnlock">Unlock</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { mapActions } from 'vuex';
import { unlockWallet } from '@/utils/sia';
import { refreshData } from '@/data';

export default {
	data() {
		return {
			password: null,
			unlocking: false,
			error: null
		};
	},
	methods: {
		...mapActions(['pushNotification']),
		async onUnlock() {
			if (this.unlocking)
				return;

			try {
				this.unlocking = true;

				if (!this.password || this.password.trim().length === 0) {
					this.error = 'Unlock password is required';
					return;
				}

				const resp = await unlockWallet(this.password);

				if (resp.statusCode !== 200) {
					if (resp.body.message && resp.body.message.indexOf('provided encryption key is incorrect') >= 0)
						throw new Error('Encryption Password is incorrect!');

					throw new Error(resp.body.message || 'Error unlocking wallet');
				}

				console.log('unlocked');

				refreshData();
			} catch (ex) {
				this.error = ex.message;
			} finally {
				this.unlocking = false;
			}
		}
	}
};
</script>

<style lang="stylus">
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
