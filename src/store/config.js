export default {
	namespaced: true,
	state: {
		config: {},
		alerts: [],
		newAlertsCount: 0
	},
	mutations: {
		setAlerts(state, alerts) {
			state.newAlertsCount = alerts.reduce((val, alert) => {
				const match = state.alerts.find(existing => existing.message === alert.message);

				if (match)
					return val;

				return val + 1;
			}, state.newAlertsCount);

			state.alerts = alerts;
		},
		setConfig(state, config) {
			state.config = config;
		}
	},
	actions: {
		setAlerts(context, alerts) {
			context.commit('setAlerts', alerts);
		},
		setConfig(context, config) {
			context.commit('setConfig', config);
		}
	}
};