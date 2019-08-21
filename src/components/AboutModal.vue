<template>
	<modal title="About Sia Host Manager" modalStyle="small" @close="$emit('close')">
		<div class="about-modal">
			<div class="about-icon">
				<sia-central />
			</div>
			<div class="versions">
				<div class="version">App Version: {{ `v${appVersion}` }}</div>
				<div class="version">Sia Daemon Version: {{ `v${daemonVersion}` }}</div>
			</div>
			<div class="about-content">
				<p>Thank you for trying out Sia Host Manager.</p>
				<p>Sia Host Manager is a 3rd party open-source host management utility for the
					Sia storage network created and maintained by Sia Central. It is designed to provide better
					and more accurate insights and financials. It does this by combining data from your hosting node
					with data from the Sia blockchain.</p>
				<p>This allows the app to get a complete picture of the health of your node and work
					around some of stil unresolved bugs in the official clients.</p>
				<div class="buttons">
					<button class="btn btn-inline" v-if="daemonManaged" @click="onOpenDataFolder">Open Data Folder</button>
					<a class="btn btn-inline" href="https://github.com/siacentral/host-manager">GitHub</a>
					<a class="btn btn-inline" href="https://siacentral.com/host-manager">Website</a>
				</div>
			</div>
		</div>
	</modal>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { remote, shell } from 'electron';
import log from 'electron-log';

import SiaCentral from '@/assets/siacentral.svg';
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
		onOpenDataFolder() {
			try {
				shell.openItem(this.config.siad_data_path);
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
	width: 100%;

	.about-content {
		font-size: 1rem;
	}

	.about-icon {
		margin: auto auto 25px;
		max-width: 150px;
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
	}
}

.buttons {
	padding: 15px 0 0;
	text-align: center;

	&:last-child {
		margin-right: 0;
	}
}
</style>
