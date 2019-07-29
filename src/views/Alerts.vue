<template>
	<div class="page page-alerts">
		<div class="alert-group">
			<div :class="getAlertClasses(alert)" v-for="alert in global" :key="alert.message">
				<div class="alert-icon"><icon :icon="alert.icon" /></div>
				<div class="alert-message">{{ alert.message }}</div>
			</div>
		</div>
		<div class="alert-group" v-for="group in grouped" :key="group.category">
			<div class="group-title">{{ group.category }}</div>
			<div :class="getAlertClasses(alert)" v-for="alert in group.alerts" :key="alert.message">
				<div class="alert-icon"><icon :icon="alert.icon" /></div>
				<div class="alert-message">{{ alert.message }}</div>
			</div>
		</div>
	</div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
	computed: {
		...mapGetters(['alerts']),
		global() {
			return this.alerts.filter(a => !a.category || a.category.toLowerCase() === 'global');
		},
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
.page.page-alerts {
	padding: 15px;
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
	grid-template-columns: 18px 1fr;
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
		width: 18px;
		height: 18px;
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
}
</style>
