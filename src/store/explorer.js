export default {
	namespaced: true,
	state: {
		host: {},
		averageSettings: {}
	},
	mutations: {
		setHost(state, host) {
			state.host = host;
		},
		setAverageSettings(state, settings) {
			state.averageSettings = settings;
		}
	},
	actions: {
		setHost(context, host) {
			context.commit('setHost', host);
		},
		setAverageSettings(context, settings) {
			context.commit('setAverageSettings', settings);
		}
	}
};