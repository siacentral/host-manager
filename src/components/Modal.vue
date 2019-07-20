<template>
	<transition name="modal" appear>
		<div class="modal-wrapper" @mousedown.self="$emit('close')">
			<div class="modal">
				<div class="modal-header">
					<div class="modal-title">{{ title }}</div>
					<div class="modal-controls">
						<button class="modal-close" @click="$emit('close')"><icon icon="times" /></button>
					</div>
				</div>
				<div class="modal-content">
					<slot></slot>
				</div>
			</div>
		</div>
	</transition>
</template>

<script>
export default {
	props: {
		title: String
	}
};
</script>

<style lang="stylus" scoped>
.modal-wrapper {
	position: fixed;
    display: flex;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    padding: 30px;
    background-color: rgba(0, 0, 0, 0.3);
    transform-origin: 50% 50%;
    transform: scale(1);
    align-items: center;
    justify-content: center;
	z-index: 999;

	.modal {
		position: relative;
		display: grid;
		max-width: 90%;
		max-height: 90%;
		min-width: 500px;
		grid-template-rows: auto minmax(auto, 1fr);
		grid-template-columns: 100%;
		padding: 15px 30px;
		grid-gap: 15px;
		overflow: hidden;
		background-image: linear-gradient(225deg, #25272a 0%, #1d1e21 100%);
		box-shadow: 0 2px 11px rgba(0, 0, 0, 0.5);
		border-radius: 8px;

		.modal-content {
			width: 100%;
			height: 100%;
			overflow-y: auto;
		}
	}

	.modal-header {
		display: grid;
		grid-template-columns: repeat(2, auto);
		align-items: center;
		justify-content: space-between;

		.modal-title {
			font-size: 1.2rem;
			color: rgba(255, 255, 255, 0.54);
			text-align: left;
		}
	}

	.modal-close {
		font-size: 1.4rem;
		padding: 5px;
		border: none;
		background: none;
		outline: none;
		color: rgba(255, 255, 255, 0.54);
		transition: all 0.3s ease;
		cursor: pointer;

		&:hover, &:active, &:focus {
			color: primary;
		}
	}
}

.modal-enter-active {
	animation: modal-fade 0.3s cubic-bezier(0.15, 0.32, 0.55, 1.35);
}

.modal-leave-active {
	animation: modal-fade 0.3s cubic-bezier(0.15, 0.32, 0.55, 1.35) reverse;
}

@keyframes modal-fade {
	0% {
		transform: scale(1.2);
		opacity: 0;
	}

	100% {
		transform: scale(1);
		opacity: 1;
	}
}
</style>
