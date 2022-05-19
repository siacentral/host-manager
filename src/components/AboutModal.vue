<template>
	<modal title="About Sia Host Manager" modalStyle="medium" @close="$emit('close')">
		<div class="about-modal">
			<div class="about-icon">
				<sia-central />
			</div>
			<div class="versions">
				<div class="version">App Version: {{ `v${appVersion}` }}</div>
				<div class="version">Sia Daemon Version: {{ `v${daemonVersion}` }}</div>
			</div>
			<div class="about-content">
				<p>Thank you for trying out Sia Host Manager, a 3rd party open-source host management
					utility for the Sia storage network.</p>
				<p>Host Manager is designed from the ground up to provide a better experience for
					hosts. It gives you access to all of the controls and configuration that Sia
					has to offer in a smart and user friendly package.</p>
				<p>By combining data from the host with data from the blockchain Host Manager is able
					to provide in-depth financials and health alerts.</p>
				<p><b>Created and maintained by Sia Central</b></p>
			</div>
			<div class="buttons">
				<button class="btn btn-inline" @click="onOpenLogFolder">Log</button>
				<button class="btn btn-inline" v-if="daemonManaged" @click="onOpenDataFolder">Data Folder</button>
				<a class="btn btn-inline" href="https://github.com/siacentral/host-manager">GitHub</a>
				<a class="btn btn-inline" href="https://siacentral.com/host-manager">Website</a>
			</div>
		</div>
	</modal>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { remote, shell } from 'electron';
import { getLogPath } from '@/utils';
import log from 'electron-log';

import SiaCentral from '@/components/svg/SiaCentral';
import Modal from '@/components/Modal';

const appVersion = remote.app.getVersion();

export default {
	components: {
		Modal,
		SiaCentral
	},
	computed: {
		...mapState({
			daemonVersion: state => state.hostDaemon.version,
			daemonManaged: state => state.hostDaemon.managed,
			config: state => state.config
		}),
		appVersion() {
			return appVersion;
		}
	},
	methods: {
		...mapActions(['pushNotification']),
		onOpenLogFolder() {
			try {
				shell.openPath(getLogPath());
			} catch (ex) {
				log.error('onOpenLogFolder', ex.message);
				this.pushNotification({
					message: ex.message,
					icon: 'info',
					severity: 'danger'
				});
			}
		},
		onOpenDataFolder() {
			try {
				shell.openPath(this.config.siad_data_path);
			} catch (ex) {
				log.error('open data folder', ex.message);
				this.pushNotification({
					message: ex.message,
					icon: 'info',
					severity: 'danger'
				});
			}
		}
	}
};
</script>

<style lang="stylus" scoped>
.about-modal {
	display: grid;
	grid-template-columns: auto minmax(0, 1fr);
	grid-template-rows: minmax(0, 1fr) auto auto;
	grid-gap: 15px;
	width: 100%;

	.about-content {
		font-size: 1rem;
		overflow: auto;
	}

	.about-icon {
		margin: auto;
		max-width: 150px;
		grid-area: 1 / 1;
	}

	.version {
		color: primary;
		margin-bottom: 8px;

		&:last-child {
			margin-bottom: 0;
		}
	}

	.versions {
		padding: 8px;
		background: #191919;
		border: 1px solid dark-gray;
		border-radius: 8px;
		grid-area: 2 / 1 / 2 / span 2;
	}
}

.buttons {
	padding: 15px 0 0;
	text-align: center;
	grid-area: 3 / 1 / 3 / span 2;

	&:last-child {
		margin-right: 0;
	}
}
</style>
