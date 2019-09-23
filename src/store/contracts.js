export default {
	namespaced: true,
	state: {
		stats: {},
		contracts: [],
		alerts: [],
		newAlertsCount: 0
	},
	mutations: {
		setStats(state, stats) {
			state.stats = stats;
		},
		setContracts(state, contracts) {
			state.contracts = contracts;
		},
		setAlerts(state, alerts) {
			state.newAlertsCount = alerts.reduce((val, alert) => {
				const match = state.alerts.find(existing => existing.id ? existing.id === alert.id : existing.message === alert.message);

				if (match)
					return val;

				return val + 1;
			}, 0);

			state.alerts = alerts;
		}
	},
	actions: {
		setStats(context, stats) {
			context.commit('setStats', stats);
		},
		setContracts(context, contracts) {
			context.commit('setContracts', contracts);
		},
		setAlerts(context, alerts) {
			context.commit('setAlerts', alerts);
		}
	}
};