export default {
	namespaced: true,
	state: {
		alerts: [],
		connectable: false,
		error: null,
		report: null
	},
	mutations: {
		setConnectability(state, report) {
			state.connectable = report.connected && report.exists_in_hostdb && report.settings_scanned;
			state.error = !report.message || report.message === 'success' ? null : report.message;
			state.report = report;

			if (!state.connectable || state.error) {
				state.alerts = [{
					icon: 'wifi',
					severity: state.connectable && !state.error ? 'warning' : 'danger',
					message: state.error ? state.error : 'Your host does not appear to be connectable. Renters may be unable to access their data'
				}];
			}
		}
	},
	actions: {
		setConnectability(context, report) {
			context.commit('setConnectability', report);
		}
	}
};