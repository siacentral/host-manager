export default {
	namespaced: true,
	state: {
		managed: false,
		loaded: false,
		loadPercent: 0,
		currentModule: '',
		output: '',
		error: '',
		version: '0.0.0'
	},
	mutations: {
		setManaged(state, managed) {
			state.managed = managed;
		},
		setLoaded(state, loaded) {
			state.loaded = loaded;
		},
		setLoadPercent(state, loadPercent) {
			state.loadPercent = loadPercent;
		},
		setCurrentModule(state, currentModule) {
			state.currentModule = currentModule;
		},
		setError(state, output) {
			state.output = output;
		},
		setOutput(state, error) {
			state.error = error;
		},
		setVersion(state, version) {
			state.version = version;
		}
	},
	actions: {
		setManaged(context, managed) {
			context.commit('setManaged', managed);
		},
		setLoaded(context, loaded) {
			context.commit('setLoaded', loaded);
		},
		setLoadPercent(context, loadpercent) {
			context.commit('setLoadPercent', loadpercent);
		},
		setCurrentModule(context, currentModule) {
			context.commit('setCurrentModule', currentModule);
		},
		setError(context, output) {
			context.commit('setError', output);
		},
		setOutput(context, error) {
			context.commit('setOutput', error);
		},
		setVersion(context, version) {
			context.commit('setVersion', version);
		}
	}
};