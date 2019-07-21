<template>
	<div :class="{ 'create-wallet': true, 'wallet-error': error }">
		<div class="create-wallet-info">
			<div class="create-wallet-icon">
				<icon icon="wallet" />
			</div>
			<transition mode="out-in" name="fade">
				<h3 :key="title">{{ title }}</h3>
			</transition>
			<transition mode="out-in" name="fade">
				<p :key="text">{{ text }}</p>
			</transition>
			<transition mode="out-in" name="fade">
				<div class="wallet-step" v-if="step === 'created'" key="created">
					<div class="control">
						<label>Wallet Seed</label>
						<input type="text" v-model="seed" readonly/>
					</div>
					<div class="buttons">
						<button class="btn btn-success btn-inline" @click="$emit('close')">Done</button>
					</div>
				</div>
				<div class="wallet-step" v-else-if="step === 'create'" key="creating">
					<div class="control">
						<label>Unlock Password</label>
						<input type="text" v-model="password" />
					</div>
					<div class="buttons">
						<button class="btn btn-success btn-inline" @click="onCreateWallet" :disabled="creating">Create Wallet</button>
					</div>
				</div>
				<div class="wallet-step" v-else-if="step === 'recover'">
					<div class="control">
						<label>Recovery Seed</label>
						<input type="text" v-model="recoverSeed" />
					</div>
					<div class="control">
						<label>Unlock Password</label>
						<input type="text" v-model="password" />
					</div>
					<div class="buttons">
						<button class="btn btn-success btn-inline" @click="onRecoverWallet" :disabled="creating">Recover Wallet</button>
					</div>
				</div>
				<div class="buttons" v-else key="buttons">
					<button class="btn btn-inline btn-success" @click="step = 'create'">Create New Wallet</button>
					<button class="btn btn-inline" @click="step = 'recover'">Recover From Seed</button>
				</div>
			</transition>
		</div>
	</div>
</template>

<script>
import { mapActions } from 'vuex';
import { createWallet, recoverWallet } from '@/utils/sia';
import { refreshData } from '@/data';

export default {
	data() {
		return {
			step: null,
			recoverSeed: null,
			password: null,
			creating: false,
			seed: null,
			error: null
		};
	},
	computed: {
		title() {
			if (this.creating && this.step === 'recover')
				return 'Recovering your wallet';
			else if (this.creating && this.step === 'create')
				return 'Initializing wallet';
			else if (this.step === 'create')
				return 'Create a new wallet';
			else if (this.step === 'recover')
				return 'Recover your wallet';
			else if (this.step === 'created')
				return 'Wallet created!';

			return 'It looks like you don\'t have a wallet yet';
		},
		text() {
			if (this.error)
				return this.error;

			if (this.creating && this.step === 'recover')
				return 'Hang on while we recover your wallet';
			else if (this.creating && this.step === 'create')
				return 'We\'re getting a brand new wallet set up for you.';
			else if (this.step === 'recover')
				return 'Enter your 29 word seed and an unlock password below to recover your wallet';
			else if (this.step === 'create')
				return 'Enter an unlock password to create and encrypt a new wallet';
			else if (this.step === 'created') {
				return 'Your wallet has been created, please copy your 29 word seed to a safe place. ' +
					'You will need to unlock your wallet with the password you used.';
			}

			return 'Would you like to create a brand new wallet or recover from an existing seed?';
		}
	},
	methods: {
		...mapActions(['pushNotification']),
		async onCreateWallet() {
			if (this.creating)
				return;

			try {
				this.creating = true;

				if (!this.password || this.password.trim().length === 0) {
					this.error = 'Unlock password is required';
					return;
				}

				const resp = await createWallet(this.password);

				if (resp.statusCode !== 200)
					throw new Error(resp.body.message || 'Error creating wallet');

				this.seed = resp.body.primaryseed;
				this.step = 'created';
				this.error = null;

				refreshData();
			} catch (ex) {
				this.error = ex.message;
			} finally {
				this.creating = false;
			}
		},
		async onRecoverWallet() {
			if (this.creating)
				return;

			try {
				this.creating = true;

				if (!this.recoverSeed || !this.password || this.recoverSeed.trim().length === 0 || this.password.trim().length === 0) {
					this.error = 'Recovery seed and password are required';
					return;
				}

				this.recoverSeed = this.recoverSeed.trim();

				if (this.recoverSeed.split(' ').length !== 29) {
					this.error = 'Recovery seed should be 29 words';
					return;
				}

				const resp = await recoverWallet(this.recoverSeed, this.password);

				if (resp.statusCode !== 400)
					throw new Error(resp.body.message || 'Error recovering seed');

				this.seed = resp.body.primaryseed;
				this.step = 'created';
				this.error = null;

				refreshData();
			} catch (ex) {
				this.error = ex.message;
			} finally {
				this.creating = false;
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
