<template>
	<nav class="primary">
		<div class="nav-logo">
			<sia-central /> Sia Host Manager
		</div>
		<health-status />
		<div class="top-nav">
			<a href="#" class="sub-nav-item" @click.prevent="onClickAlerts">
				<icon icon="bell" />
				<transition name="fade" appear>
					<span class="badge" v-if="newAlertsCount && newAlertsCount > 0">{{ newAlertsCount >= 10 ? '+' : newAlertsCount }}</span>
				</transition>
			</a>
			<a href="#" class="sub-nav-item" @click.prevent="modal = 'about'"><icon icon="info" /></a>
			<a href="#" class="sub-nav-item" @click.prevent="modal = 'settings'"><icon icon="cogs" /></a>
		</div>
		<div class="nav-items">
			<router-link class="nav-item" :to="{ name: 'dashboard' }"><icon icon="chart-pie" /> Dashboard</router-link>
			<router-link class="nav-item" :to="{ name: 'storage' }"><icon icon="hdd" /> Storage</router-link>
			<router-link class="nav-item" :to="{ name: 'contracts' }"><icon icon="file-contract" /> Contracts</router-link>
			<router-link class="nav-item" :to="{ name: 'config' }"><icon icon="wrench" /> Configuration</router-link>
		</div>
		<transition mode="out-in" name="fade" appear>
			<update-item v-if="update && update.available" />
		</transition>
		<settings-modal v-if="modal === 'settings'" @close="modal = null" />
		<about-modal v-if="modal === 'about'" @close="modal = null" />
		<alerts-panel v-if="modal === 'alerts'" @close="modal = null" />
	</nav>
</template>

<script>
import log from 'electron-log';
import { mapState, mapGetters, mapActions } from 'vuex';

import AboutModal from '@/components/AboutModal';
import AlertsPanel from '@/components/Alerts';
import HealthStatus from '@/components/HealthStatus';
import SettingsModal from '@/components/SettingsModal';
import SiaCentral from '@/assets/siacentral.svg';
import UpdateItem from '@/components/update/UpdateItem';

export default {
	components: {
		AboutModal,
		AlertsPanel,
		HealthStatus,
		SettingsModal,
		SiaCentral,
		UpdateItem
	},
	data() {
		return {
			modal: null
		};
	},
	computed: {
		...mapGetters(['newAlertsCount']),
		...mapState(['update'])
	},
	methods: {
		...mapActions(['clearNewAlerts']),
		onClickAlerts() {
			try {
				this.clearNewAlerts();
				this.modal = 'alerts';
			} catch (ex) {
				log.error('alerts menu item click', ex.message);
			}
		}
	}
};
</script>

<style lang="stylus" scoped>
nav.primary {
    position: absolute;
	display: grid;
    top: 0;
    left: 0;
    bottom: 0;
    grid-template-rows: repeat(3, min-content) minmax(0, 1fr) repeat(2, min-content);
    width: 200px;
	padding-top: 30px;
	background: bg-accent;
	box-shadow: 2px 0px 5px rgba(0, 0, 0, 0.22);

	.nav-logo.nav-logo {
		font-size: 1rem;
		color: primary;
		border-bottom: 1px solid #3a3a3a;
		cursor: default;
	}

	.nav-item, .nav-logo {
		position: relative;
		display: flex;
		align-items: center;
		color: rgba(0, 0, 0, 0.54);
		padding: 15px;
		font-size: 0.8rem;
		text-align: left;
		white-space: nowrap;
		text-decoration: none;
		transition: color 0.3s linear;
		cursor: pointer;

		span.badge {
			position: absolute;
			right: 15px;
			color: rgba(255, 255, 255, 0.27);
		}

		&.router-link-exact-active.router-link-exact-active {
			color: primary;
		}

		svg, svg.svg-inline--fa.svg-inline--fa {
			width: 18px;
			height: 18px;
			margin-right: 15px;
		}
	}

	.top-nav {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		grid-gap: 5px;
		border-bottom: 1px solid dark-gray;
		background: #191919;
		margin-bottom: 15px;

		.sub-nav-item {
			position: relative;
			display: block;
			padding: 15px;
			color: rgba(255, 255, 255, 0.54);
			font-size: 0.8rem;
			text-align: center;
			white-space: nowrap;
			text-decoration: none;
			cursor: pointer;
			border-right: 1px solid dark-gray;
			transition: color 0.3s linear;

			span.badge {
				position: absolute;
				transform: translateY(9px) translateX(-5px);
				background: negative-accent;
				width: 14px;
				height: 14px;
				border-radius: 100%;
				line-height: 14px;
				font-size: 0.7rem;
				color: rgba(255, 255, 255, 0.84);
			}

			svg.svg-inline--fa {
				width: 16px;
				height: 16px;
			}

			&:hover, &:focus, &:active {
				color: primary;
			}

			&:last-child {
				border-right: none;
			}
		}
	}
}

body.win32, body.linux {
	nav.primary {
		padding: 0;
	}
}

body.dark {
	.title-bar {
		background: bg-dark-accent;
	}

	nav.primary {
		background: bg-dark-accent;

		a {
			color: rgba(255, 255, 255, 0.54);
		}
	}
}
</style>
