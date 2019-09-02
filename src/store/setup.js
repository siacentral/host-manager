export default {
	namespaced: true,
	state: {
		firstRun: true
	},
	mutations: {
		setFirstRun(state, firstRun) {
			state.firstRun = firstRun;
		}
	},
	actions: {
		setFirstRun(context, firstRun) {
			context.commit('setFirstRun', firstRun);
		}
	}
};