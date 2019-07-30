<template>
	<nav class="primary">
		<div class="nav-logo">
			<sia-central /> SiaCentral
		</div>
		<health-status />
		<div class="top-nav">
			<a href="#" class="sub-nav-item" @click.prevent="modal = 'alerts'"><icon icon="bell" /></a>
			<a href="#" class="sub-nav-item" @click.prevent="modal = 'about'"><icon icon="info" /></a>
			<a href="#" class="sub-nav-item" @click.prevent="modal = 'settings'"><icon icon="cogs" /></a>
		</div>
		<router-link class="nav-item" :to="{ name: 'dashboard' }"><icon icon="chart-pie" /> Dashboard</router-link>
		<router-link class="nav-item" :to="{ name: 'storage' }"><icon icon="hdd" /> Storage</router-link>
		<router-link class="nav-item" :to="{ name: 'contracts' }"><icon icon="file-contract" /> Contracts</router-link>
		<router-link class="nav-item" :to="{ name: 'config' }"><icon icon="wrench" /> Configuration</router-link>
		<settings-modal v-if="modal === 'settings'" @close="modal = null" />
		<about-modal v-if="modal === 'about'" @close="modal = null" />
		<alerts-panel v-if="modal === 'alerts'" @close="modal = null" />
	</nav>
</template>

<script>
import { mapGetters } from 'vuex';

import AboutModal from '@/components/AboutModal';
import AlertsPanel from '@/components/Alerts';
import HealthStatus from '@/components/HealthStatus';
import SettingsModal from '@/components/SettingsModal';
import SiaCentral from '@/assets/siacentral.svg';

export default {
	components: {
		AboutModal,
		AlertsPanel,
		HealthStatus,
		SettingsModal,
		SiaCentral
	},
	data() {
		return {
			modal: null
		};
	},
	computed: {
		...mapGetters(['alerts'])
	}
};
</script>

<style lang="stylus" scoped>
nav.primary {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 200px;
	padding: 30px 0;
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

			&:hover, &:focus, &:active {
				color: primary;
			}

			&:last-child {
				border-right: none;
			}
		}
	}
}

body.win32 nav.primary {
	padding: 0;
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
