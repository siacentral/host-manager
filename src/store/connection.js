export default {
	namespaced: true,
	state: {
		alerts: [],
		newAlertsCount: 0,
		connectable: false,
		error: null,
		report: null
	},
	mutations: {
		setConnectability(state, report) {
			const alerts = [];

			state.connectable = report.connected && report.exists_in_hostdb && report.settings_scanned;
			state.error = !report.message || report.message === 'success' ? null : report.message;
			state.report = report;

			if (!state.connectable || state.error) {
				alerts.push({
					icon: 'wifi',
					severity: state.connectable && !state.error ? 'warning' : 'danger',
					message: state.error ? state.error : 'Your host does not appear to be connectable. Renters may be unable to access their data'
				});

				state.newAlertsCount = alerts.reduce((val, alert) => {
					const match = state.alerts.find(existing => existing.message === alert.message);

					if (match)
						return val;

					return val + 1;
				}, state.newAlertsCount);
			}

			state.alerts = alerts;
		}
	},
	actions: {
		setConnectability(context, report) {
			context.commit('setConnectability', report);
		}
	}
};