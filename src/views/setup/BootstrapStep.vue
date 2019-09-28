<template>
	<setup-step>
		<template v-slot:info>
			<div class="setup-icon">
				<icon icon="fast-forward" />
			</div>
			<h3>Would you like to bootstrap your consensus?</h3>
			<p>Please select a provider to bootstrap from below. Downloading a consensus snapshot can make your client sync significantly faster. However, you are
				trusting that the transaction history in the snapshot is completely accurate. It is more secure to sync the entire blockchain from scratch.</p>
			<transition name="fade" mode="out-in" appear>
				<div class="error" v-if="error" :key="error">{{ error }}</div>
			</transition>
		</template>
		<transition name="fade" mode="out-in" appear>
			<div class="download-progress" v-if="complete">
				<p>Bootstrap from {{ selectedProvider.name }} complete! Block height will start at {{ selectedProvider.height }}</p>
			</div>
			<div class="download-progress" v-else-if="downloadComplete">
				<p>Consensus downloaded. Decompressing. This can take some time. Please wait.</p>
			</div>
			<div class="download-progress" v-else-if="downloading">
				<progress-bar :progress="downloadProgress" />
				<p>Bootstraping from {{ selectedProvider.name }} to height {{ selectedProvider.height }} around {{ formatDuration(downloadEstimate) }} remaining ({{ formatByteString(downloadBytes, 2) }}/{{ formatByteString(downloadTotal, 2) }} - {{ formatByteSpeed(downloadSpeed, 2) }})</p>
			</div>
			<div v-else>
				<transition-group name="fade" tag="div" class="bootstrap-providers">
					<div class="provider" v-for="provider in providers" :key="provider.name">
						<div class="provider-name">Bootstrap from {{ provider.name }}</div>
						<div class="provider-stat">{{ provider.height }}<span class="sub-label">Block Height</span></div>
						<div class="provider-stat">{{ provider.size }}<span class="sub-label">Compressed Size</span></div>
						<div class="provider-stat">{{ provider.timestamp }}<span class="sub-label">Timestamp</span></div>
						<div class="provider-action">
							<button class="btn btn-inline" @click="onDownload(provider)">Start Download</button>
						</div>
					</div>
				</transition-group>
			</div>
		</transition>
		<template v-slot:controls>
			<transition name="fade" mode="out-in">
				<button class="btn btn-danger btn-inline" @click="onCancel" key="cancelDownload" v-if="downloading && !downloadComplete">Cancel</button>
				<button class="btn btn-success btn-inline" @click="onNext(1)" v-else :key="buttonText" :disabled="loading || setting || downloading">{{ buttonText }}</button>
			</transition>
		</template>
	</setup-step>
</template>

<script>
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import log from 'electron-log';
import { mapActions } from 'vuex';

import ProgressBar from '@/components/ProgressBar';
import SetupStep from './SetupStep';
import { getSiaCentralBootstrap } from '@/api/siacentral';
import { getSiaStatsBootstrap } from '@/api/siastats';
import { downloadFile } from '@/utils/bootstrap';
import { formatByteString, formatDate, formatDuration, formatByteSpeed } from '@/utils/format';

export default {
	components: {
		SetupStep,
		ProgressBar
	},
	props: {
		config: Object,
		fresh: Boolean
	},
	data() {
		return {
			loading: true,
			setting: false,
			downloading: false,
			downloadComplete: false,
			canceling: false,
			complete: false,
			providers: [],
			downloadBytes: 0,
			downloadTotal: 0,
			downloadProgress: 0.01,
			downloadSpeed: 0,
			downloadEstimate: 0,
			error: null,
			selectedProvider: null,
			downloadReq: null
		};
	},
	computed: {
		buttonText() {
			return this.downloading || this.complete ? 'Next' : 'Sync from Scratch';
		}
	},
	async beforeMount() {
		try {
			await Promise.all([
				// disabled SiaStats for now, unzipper is throwing an error with the archive, but I can unzip it freely myself.
				// this.loadSiaStatsBootstrap(),
				this.loadSiaCentralBootstrap()
			]);
		} catch (ex) {
			log.error('load bootstrap', ex.message);
		} finally {
			this.loading = false;
		}
	},
	methods: {
		...mapActions(['pushNotification']),
		formatDuration,
		formatByteSpeed,
		formatByteString,
		async loadSiaCentralBootstrap() {
			try {
				const resp = await getSiaCentralBootstrap();

				if (resp.status !== 200 && resp.body.type !== 'success')
					throw new Error(resp.body.message);

				const fmt = new Intl.NumberFormat([], {}),
					timestamp = new Date(resp.body.snapshot.timestamp);

				this.providers.push({
					name: 'Sia Central',
					download_url: resp.body.snapshot.download_url,
					hash: resp.body.snapshot.block_hash,
					height: fmt.format(resp.body.snapshot.block_height),
					size: formatByteString(parseFloat(resp.body.snapshot.compressed_size), 2),
					timestamp: formatDate(timestamp)
				});
			} catch (ex) {
				log.error('loadSiaCentralBootstrap', ex.message);
			}
		},
		async loadSiaStatsBootstrap() {
			try {
				const resp = await getSiaStatsBootstrap(),
					fmt = new Intl.NumberFormat([], {}),
					timestamp = new Date(parseFloat(resp.body.timestamp) * 1000);

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
		async onCancel() {
			this.canceling = true;
			this.error = 'Bootstrap cancelled';
			this.downloading = false;
			this.downloadComplete = false;
			this.complete = false;
			this.selectedProvider = null;

			try {
				this.downloadReq.abort();
			} catch (ex) {
				log.error('cancel bootstrap', ex.message);
			}

			try {
				const tempPath = path.join(this.config.siad_data_path, `host-manager-bootstrap-dl.tmp`);

				await fs.promises.unlink(tempPath);
			} catch (ex) {
				log.error('cancel bootstrap', ex.message);
			}
		},
		async onDownload(provider) {
			if (this.downloading)
				return;

			try {
				this.downloading = true;
				this.complete = false;
				this.canceling = false;
				this.error = null;
				this.selectedProvider = provider;

				const tempPath = path.join(this.config.siad_data_path, `host-manager-bootstrap-dl.tmp`);

				try {
					await fs.promises.unlink(tempPath);
				} catch (ex) {}

				await fs.promises.mkdir(this.config.siad_data_path, {
					recursive: true
				});

				const out = fs.createWriteStream(tempPath);

				out.on('error', this.onError);

				const req = downloadFile({
					uri: provider.download_url,
					progress: this.onDownloadProgress,
					done: this.onDownloadComplete,
					error: this.onError
				});

				out.on('finish', () => this.onDownloadComplete);

				switch (provider.name) {
				case 'Sia Central': // Sia Central provides a .gz file which can be piped directly to disk
					const gzip = zlib.createGunzip();

					req.pipe(gzip).pipe(out);
					break;
				default:
					throw new Error('unknown provider');
				}

				this.downloadReq = req;
			} catch (ex) {
				this.onError(ex);
				log.error('onDownload', ex.message);
			}
		},
		onDownloadProgress(progress) {
			this.downloadBytes = progress.downloaded;
			this.downloadTotal = progress.total;
			this.downloadProgress = progress.progress;
			this.downloadSpeed = progress.downloadSpeed;
			this.downloadEstimate = progress.estimatedRemaining;
		},
		async onDownloadComplete() {
			try {
				if (this.error)
					return;

				const consensusPath = path.join(this.config.siad_data_path, 'consensus'),
					tempPath = path.join(this.config.siad_data_path, `host-manager-bootstrap-dl.tmp`);

				await fs.promises.mkdir(consensusPath, {
					recursive: true
				});

				switch (this.selectedProvider.name) {
				case 'Sia Central':
					await fs.promises.rename(tempPath, path.join(consensusPath, 'consensus.db'));
					break;
				default:
					throw new Error('unsupported provider');
				}

				this.complete = true;
			} catch (ex) {
				this.onError(ex);
				log.error('bootstrap error', ex.message);
			} finally {
				this.downloading = false;
			}
		},
		async onError(ex) {
			try {
				try {
					this.downloadReq.abort();
				} catch (ex) {}

				try {
					await fs.promies.unlink(path.join(this.config.siad_data_path, 'host-manager-bootstrap-dl.tmp'));
				} catch (ex) {
					log.error('delete tmp bootstrap', ex.message);
				}

				if (this.canceling)
					return;

				log.error('bootstrap error', ex.message);

				this.downloadReq = null;

				this.pushNotification({
					severity: 'error',
					icon: 'save',
					message: ex.message
				});

				this.error = ex.message;
			} catch (ex2) {
				log.error('bootstrap error', ex2.message);
			} finally {
				this.downloading = false;
				this.complete = false;
			}
		},
		onNext(n) {
			if (this.setting)
				return;

			try {
				this.setting = true;

				this.$emit('done', {
					inc: n
				});
			} catch (ex) {
				log.error('bootstrap setup', ex.message);
			} finally {
				this.setting = false;
			}
		}
	}
};
</script>

<style lang="stylus" scoped>
.error {
	font-size:0.9rem;
	color: negative-accent;
	padding-top: 15px;
}

.bootstrap-providers {
	display: grid;
	grid-auto-columns: min-content;
	grid-auto-rows: auto;
	grid-auto-flow: column;
	justify-content: center;
	align-content: center;
	grid-gap: 15px;
}

.download-progress {
	p {
		margin-top: 15px;
	}
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
