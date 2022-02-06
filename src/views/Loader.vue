<template>
	<transition name="fade-slow">
		<div :class="loaderClasses">
			<div class="loader-content">
				<transition name="fade" appear>
					<div class="loader-icon">
						<svg viewBox="0 0 500 500" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:1.5;fill:none;stroke:currentColor;stroke-width:30px;">
							<g>
								<path d="M458.416,264.045c22.691,85.77 -28.347,173.927 -114.108,196.906c-27.249,7.301 -54.752,7.152 -80.342,0.802c40.888,-39.394 59.718,-99.253 43.995,-157.934c-11.115,-41.482 13.539,-84.184 55.022,-95.299c41.482,-11.115 84.184,13.539 95.299,55.021l0.134,0.504Z" />
								<path d="M170.155,80.336c62.934,-62.536 164.799,-62.414 227.58,0.368c19.948,19.948 33.57,43.841 40.866,69.177c-54.561,-15.713 -115.815,-2.091 -158.773,40.866c-30.367,30.367 -79.675,30.367 -110.042,0c-30.367,-30.367 -30.367,-79.676 0,-110.043l0.369,-0.368Z" />
								<path d="M155.189,421.832c-85.625,-23.234 -136.451,-111.513 -113.471,-197.274c7.301,-27.249 21.182,-50.993 39.476,-69.979c13.673,55.108 56.096,101.344 114.777,117.068c41.482,11.115 66.136,53.817 55.021,95.3c-11.115,41.482 -53.817,66.136 -95.3,55.021l-0.503,-0.136Z" />
							</g>
						</svg>
					</div>
				</transition>
				<transition name="fade" appear>
					<progress-bar v-if="progress && progress > 0" :progress="progress * 100" />
				</transition>
				<transition name="fade" mode="out-in" appear>
					<div class="loader-text" :key="text" v-if="text">{{ text }}</div>
				</transition>
				<transition name="fade" mode="out-in" appear>
					<div class="loader-sub-text" :key="subText" v-if="subText">{{ subText }}</div>
				</transition>
			</div>
		</div>
	</transition>
</template>

<script>
import ProgressBar from '@/components/ProgressBar';

export default {
	components: {
		ProgressBar
	},
	props: {
		text: String,
		subText: String,
		severity: String,
		progress: Number
	},
	mounted() {
		window.setTimeout(() => {
			this.$emit('animated');
		}, 6000);
	},
	computed: {
		loaderClasses() {
			const classes = { loader: true };

			classes[`loader-${this.severity}`] = true;

			return classes;
		}
	}
};
</script>

<style lang="stylus" scoped>
.loader {
	position: fixed;
	top: 0;
	left: 0;
	bottom: 0;
	right: 0;
	background-color: bg-dark;
	background-image: linear-gradient(225deg, bg-dark-accent 0%, bg-dark 100%);
	z-index: 999;

	&.loader-success {
		color: primary;
	}

	&.loader-warning {
		color: warning-accent;
	}

	&.loader-danger {
		color: negative-accent;
	}

	.loader-content {
		display: grid;
		width: 100%;
		height: 100%;
		max-width: 800px;
		margin: auto;
		padding: 30px;
		grid-template-rows: 1fr auto auto auto;
		grid-gap: 30px;
		text-align: center;
		align-items: center;
	}

	.loader-text {
		font-size: 1.4rem;
	}

	.loader-sub-text {
		color: rgba(255, 255, 255, 0.54);
	}

	svg {
		animation: rotateSVG 3s ease infinite;
		animation-delay: 3s;
		width: 300px;
		height: 300px;
		margin: auto;
		transition: all 0.4s ease;
	}

	svg path {
		transform-origin: 50% 50%;
		animation: drawSVG 2s ease 1;
	}
}

@keyframes rotateSVG {
	0% {
		transform: rotateZ(360deg)
	}
	50% {
		transform: rotateZ(0deg)
	}
}

@keyframes drawSVG {
	0% {
		stroke-dasharray: 0 752;
		opacity: 0;
	}

	80% {
		opacity: 1;
	}

	100% {
		stroke-dasharray: 752 752;
	}
}
</style>
