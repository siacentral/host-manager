<template>
	<div class="app-update-wrapper">
		<div class="app-update-info" @click="showModal = (update && update.ready)">
			<div class="update-icon">
				<icon icon="upload" />
			</div>
			<div>
				<transition name="fade" mode="out-in">
					<div class="update-description" :key="updateText">{{ updateText }}</div>
				</transition>
				<transition name="fade" mode="out-in">
					<div class="update-progress" v-if="!update.ready && updateProgress && updateProgress.percent">
						<progress-bar :progress="updateProgress.percent" />
					</div>
				</transition>
			</div>
		</div>
		<update-modal v-if="showModal" @close="showModal = false" />
	</div>
</template>

<script>
import { mapState } from 'vuex';

import ProgressBar from '@/components/ProgressBar';
import UpdateModal from './UpdateModal';

export default {
	components: {
		ProgressBar,
		UpdateModal
	},
	computed: {
		...mapState([
			'update',
			'updateProgress'
		]),
		updateText() {
			if (this.update && this.update.ready)
				return `Update is ready to install!`;

			if (this.updateProgress && this.updateProgress.percent)
				return 'Update downloading...';

			return 'Update available...';
		}
	},
	data() {
		return {
			showModal: false
		};
	}
};
</script>

<style lang="stylus" scoped>
.app-update-info {
    padding: 10px;
    display: grid;
    grid-template-columns: 20px minmax(0, 1fr);
    align-items: center;
    background: #191919;
	color: primary;
    grid-gap: 10px;
	cursor: pointer;

	.update-icon {
		grid-row: 1 / -1;

		svg {
			width: 20px;
		}
	}

	.update-description {
		font-size: 0.9rem;
	}

	.update-progress {
		margin-top: 10px;
	}
}
</style>