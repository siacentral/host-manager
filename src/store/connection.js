export default {
	namespaced: true,
	state: {
		connectable: false,
		error: null,
		report: null
	},
	mutations: {
		setConnectability(state, report) {
			state.connectable = report.connected && report.exists_in_hostdb && report.settings_scanned;
			state.error = !report.message || report.message === 'success' ? null : report.message;
			state.report = report;
		}
	},
	actions: {
		setConnectability(context, report) {
			context.commit('setConnectability', report);
		}
	}
};