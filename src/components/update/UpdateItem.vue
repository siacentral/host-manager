<template>
	<div class="app-update-wrapper">
		<div class="app-update-info" @click="showModal = true">
			<div class="update-icon">
				<icon icon="upload" />
			</div>
			<div class="update-description">
				Update ready to install
			</div>
		</div>
		<update-modal v-if="showModal" @close="showModal = false" />
	</div>
</template>

<script>
import UpdateModal from './UpdateModal';

export default {
	components: {
		UpdateModal
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
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 10px;
    display: grid;
    grid-template-columns: 20px minmax(0, 1fr);
    align-items: center;
    background: #191919;
	color: primary;
    grid-gap: 10px;
	cursor: pointer;

	svg {
		width: 20px;
	}

	.update-description {
		font-size: 0.9rem;
	}
}
</style>