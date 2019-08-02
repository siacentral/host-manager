export default {
	namespaced: true,
	state: {
		host: {},
		averageSettings: {},
		alerts: [],
		newAlertsCount: 0,
		report: {}
	},
	mutations: {
		setHost(state, host) {
			state.host = host;
		},
		setAverageSettings(state, settings) {
			state.averageSettings = settings;
		},
		setConnectionReport(state, report) {
			state.report = report;
		},
		setAlerts(state, alerts) {
			state.newAlertsCount = alerts.reduce((val, alert) => {
				const match = state.alerts.find(existing => existing.message === alert.message);

				if (match)
					return val;

				return val + 1;
			}, state.newAlertsCount);

			state.alerts = alerts;
		}
	},
	actions: {
		setHost(context, host) {
			context.commit('setHost', host);
		},
		setAverageSettings(context, settings) {
			context.commit('setAverageSettings', settings);
		},
		setConnectionReport(context, report) {
			context.commit('setConnectionReport', report);
		},
		setAlerts(context, alerts) {
			context.commit('setAlerts', alerts);
		}
	}
};