<template>
	<setup-step>
		<template v-slot:info>
			<div class="setup-icon">
				<icon icon="fast-forward" />
			</div>
			<h3>Would you like to bootstrap your consensus?</h3>
			<p>Downloading a consensus snapshot can make your client sync significantly faster. However, you are
				trusting that the transaction history in the snapshot is completely accurate. It is more secure to sync the entire blockchain from scratch.</p>
		</template>
		<transition-group name="fade" tag="div" class="bootstrap-providers">
			<div class="provider" v-for="provider in providers" :key="provider.name">
				<div class="provider-name">Bootstrap from {{ provider.name }}</div>
				<div class="provider-stat">{{ provider.height }}<span class="sub-label">Block Height</span></div>
				<div class="provider-stat">{{ provider.size }}<span class="sub-label">Compressed Size</span></div>
				<div class="provider-stat">{{ provider.timestamp }}<span class="sub-label">Timestamp</span></div>
				<div class="provider-action">
					<button class="btn btn-inline">Start Download</button>
				</div>
			</div>
		</transition-group>
		<template v-slot:controls>
			<button class="btn btn-success btn-inline" @click="onNext(1)" :disabled="setting">Sync from Scratch</button>
		</template>
	</setup-step>
</template>

<script>
import log from 'electron-log';
import SetupStep from './SetupStep';

import { getLatestBootstrap } from '@/api/siastats';
import { formatByteString, formatDate } from '@/utils/format';

export default {
	components: {
		SetupStep
	},
	props: {
		config: Object,
		fresh: Boolean
	},
	data() {
		return {
			setting: false,
			providers: []
		};
	},
	beforeMount() {
		this.loadSiaStatsBootstrap();
	},
	methods: {
		async loadSiaStatsBootstrap() {
			try {
				const resp = await getLatestBootstrap(),
					fmt = new Intl.NumberFormat([], {}),
					timestamp = new Date(parseFloat(resp.body.timestamp) * 1000);

				console.log(resp);

				this.providers.push({
					name: 'SiaStats',
					download_url: 'https://siastats.info/bootstrap/bootstrap.zip',
					hash: resp.body.hash,
					height: fmt.format(resp.body.height),
					size: formatByteString(parseFloat(resp.body.size) * 1e9, 2),
					timestamp: formatDate(timestamp)
				});
			} catch (ex) {
				log.error('loadSiaStatsBootstrap', ex.message);
			}
		},
		async onNext(n) {
			if (this.setting)
				return;

			try {
				this.setting = true;

				this.$emit('done', {
					inc: n,
					config: {
						siad_data_path: this.consensusLocation
					}
				});
			} catch (ex) {
				log.error('consensus location setup', ex.message);
			} finally {
				this.setting = false;
			}
		}
	}
};
</script>

<style lang="stylus" scoped>
.bootstrap-providers {
	display: grid;
	grid-auto-columns: min-content;
	grid-auto-rows: auto;
	grid-auto-flow: column;
	justify-content: center;
	align-content: center;
	grid-gap: 15px;
}

.provider {
	display: grid;
	grid-gap: 15px;
	background: bg-dark-accent;
	padding: 18px 30px;
	border-radius: 8px;
	white-space: nowrap;

	.provider-name {
		font-size: 1.2rem;
		color: rgba(255, 255, 255, 0.54);
	}

	.provider-stat {
		color: primary;
		font-size: 1.1rem;

		.sub-label {
			display: block;
			color: rgba(255, 255, 255, 0.54);
			font-size: 0.9rem;
			margin-top: 2px;
		}
	}

	.provider-action {
		text-align: center;

		:last-child {
			margin-right: 0;
		}
	}
}
</style>
