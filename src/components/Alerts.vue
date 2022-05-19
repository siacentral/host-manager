<template>
	<transition name="slide-left" appear>
	<div class="alerts-wrapper" @mousedown.self="$emit('close')">
			<div class="panel panel-alerts">
				<a href="#" class="close-button" @click.prevent="$emit('close')"><icon icon="times" /></a>
				<div class="alert-group" v-for="group in grouped" :key="group.category">
					<div class="group-title">{{ group.category }}</div>
					<div :class="getAlertClasses(alert)" v-for="alert in group.alerts" :key="alert.message">
						<div class="alert-icon"><icon :icon="alert.icon" /></div>
						<div class="alert-message">{{ alert.message }}</div>
					</div>
				</div>
			</div>
		</div>
	</transition>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
	computed: {
		...mapGetters(['alerts']),
		grouped() {
			return this.alerts.reduce((groups, a) => {
				if (!a.category || a.category.toLowerCase() === 'global')
					return groups;

				let index = groups.findIndex(g => g.category === a.category);

				if (index < 0) {
					groups.push({
						category: a.category,
						alerts: []
					});
					index = groups.length - 1;
				}

				groups[index].alerts.push(a);

				return groups;
			}, []);
		}
	},
	methods: {
		getAlertClasses(alert) {
			const classes = { alert: true };

			classes[`alert-${alert.severity}`] = true;

			return classes;
		}
	}
};
</script>

<style lang="stylus" scoped>
.alerts-wrapper {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom:0;
	z-index: 999;
}

.panel.panel-alerts {
	position: absolute;
	top: 0;
	right: 0;
	bottom: 0;
	width: 300px;
	padding: 45px 15px 15px;
	background-color: bg-dark-accent;
	box-shadow: -2px 0px 5px rgba(0, 0, 0, 0.22);

	.close-button {
		position: absolute;
		display: inline-block;
		top: 15px;
		right: 15px;
		color: rgba(255, 255, 255, 0.54);
		text-decoration: none;
		cursor: pointer;
		transition: color 0.3s ease;

		&:hover, &:active, &:focus {
			color: primary;
		}
	}
}

body.win32 {
	.alerts-wrapper {
		padding: 32px 0 15px;
	}

	.panel.panel-alerts .close-button {
		top: 45px;
	}
}

.slide-left-enter-active {
	transition: all .5s ease;
}

.slide-left-leave-active {
	transition: all .5s ease;
}

.slide-left-enter, .slide-left-leave-to {
	transform: translateX(300px);
	opacity: 0;
}

.alert-group {
	margin-bottom: 45px;
}

.group-title {
    margin-bottom: 15px;
    font-size: 1rem;
	text-transform: capitalize;
    color: rgba(255, 255, 255, 0.54);
	margin-bottom: 15px;
}

.alert {
	display: grid;
	position: relative;
	grid-template-columns: 30px 1fr;
	grid-gap: 15px;
    padding: 15px;
    border: 1px solid #00801d;
    margin-bottom: 8px;
    border-radius: 4px;
    background: primary-light;
    box-shadow: 0 5px 10px rgba(0,0,0,0.05);
    color: #00801d;
	font-size: 0.9rem;
	align-content: center;
	justify-content: center;
	align-items: center;

	.alert-icon svg.svg-inline--fa {
		width: 28px;
		height: 28px;
	}

	&.alert-danger {
		border-color: #962020;
		color: #962020;
		background: #e4d0d0;
	}

	&.alert-warning {
		border-color: #71660f;
		color: #71660f;
		background: #fffae4;
	}

	&.alert-info {
		border-color: #46606b;
		color: #46606b;
		background: #d0d4e4;
	}
}
</style>
