<template>
	<transition name="fade" appear>
		<div @mouseenter="cancelTimeout" @mouseleave="startTimeout" :class="classes" v-if="notification">
			<div class="notification-icon"><icon :icon="icon" /></div>
			<div class="notification-content">{{ notification.message }}</div>
		</div>
	</transition>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import log from 'electron-log';

export default {
	data() {
		return {
			notification: null,
			timeout: null
		};
	},
	computed: {
		...mapState(['notifications']),
		icon() {
			return this.notification && this.notification.icon ? this.notification.icon : 'hdd';
		},
		classes() {
			const classes = { 'notification': true };

			switch (this.notification.severity) {
			case 'danger':
				classes['notification-danger'] = true;
				break;
			case 'warning':
				classes['notification-warning'] = true;
				break;
			default:
				classes['notification-success'] = true;
				break;
			}

			return classes;
		}
	},
	methods: {
		...mapActions(['clearNotification']),
		startTimeout() {
			this.timeout = setTimeout(() => {
				this.notification = null;

				setTimeout(() => {
					this.clearNotification();
				}, 300);
			}, 3500);
		},
		cancelTimeout() {
			clearTimeout(this.timeout);
		}
	},
	watch: {
		notifications() {
			try {
				if (this.notification)
					return;

				this.notification = this.notifications[0];

				if (this.notification)
					this.startTimeout();
			} catch (ex) {
				log.error(ex);
			}
		}
	}
};
</script>

<style lang="stylus" scoped>
.notification {
	position: fixed;
	display: flex;
	bottom: 30px;
	right: 30px;
	left: 30px;
	padding: 20px 15px;
	font-size: 1rem;
	color: rgba(255, 255, 255, 0.84);
	align-items: center;
	justify-content: center;
	background: #191919;
	border-radius: 8px;
	box-shadow: 0 5px 10px rgba(0,0,0,0.05);

	&.notification-success {
		color: primary;
	}

	&.notification-warning {
		color: warning-accent;
	}

	&.notification-danger {
		color: negative-accent;
	}

	.notification-icon {
		margin-right: 15px;
		font-size: 1.6rem;
	}

	.notification-content {
		flex: 1;
		overflow-wrap: break-word;
	}
}

@media screen and (min-width: 767px) {
	.notification {
		left: initial;
		max-width: 300px;
	}
}
</style>
