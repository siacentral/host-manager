<template>
	<modal title="Update Sia Host Manager" modalStyle="small" @close="$emit('close')">
		<div class="update-modal">
			<div class="update-content">
				<p>Sia Host Manager {{ update.version }} has been downloaded and is ready to install.
					This update will be installed automatically the next time Sia Host Manager is
					started, or you can install it immediately.</p>
				<p>Your host be offline and inaccessible during the update.</p>
			</div>
			<div class="buttons">
				<a class="btn btn-inline" :href="changelogURL">Changelog</a>
				<button class="btn btn-inline btn-success" @click="onInstall">Install Now</button>
			</div>
		</div>
	</modal>
</template>

<script>
import { mapState } from 'vuex';
import { ipcRenderer } from 'electron';
import log from 'electron-log';

import Modal from '@/components/Modal';

export default {
	components: {
		Modal
	},
	computed: {
		...mapState(['update']),
		changelogURL() {
			return `https://github.com/siacentral/host-manager/releases/tag/${this.update.version}`;
		}
	},
	methods: {
		onInstall() {
			try {
				ipcRenderer.send('installUpdate');
			} catch (ex) {
				log.error('onInstall', ex.message);
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
.update-modal {
	width: 100%;
	height: 100%;
	overflow: hidden;

	.update-content {
		font-size: 1rem;
		overflow: auto;
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
