export default {
	namespaced: true,
	state: {
		config: {},
		pricetable: {},
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
			}, 0);

			state.alerts = alerts;
		},
		setConfig(state, config) {
			state.config = config;
		},
		setPriceTable(state, pt) {
			state.pricetable = pt;
		}
	},
	actions: {
		setAlerts(context, alerts) {
			context.commit('setAlerts', alerts);
		},
		setConfig(context, config) {
			context.commit('setConfig', config);
		},
		setPriceTable(context, pt) {
			context.commit('setPriceTable', pt);
		}
	}
};