import BigNumber from 'bignumber.js';

export default {
	namespaced: true,
	state: {
		usedStorage: new BigNumber(0),
		totalStorage: new BigNumber(0),
		readPercent: 0,
		writePercent: 0,
		folders: [],
		alerts: []
	},
	mutations: {
		setUsedStorage(state, storage) {
			state.usedStorage = storage;
		},
		setTotalStorage(state, storage) {
			state.totalStorage = storage;
		},
		setReadPercent(state, percent) {
			state.readPercent = percent;
		},
		setWritePercent(state, percent) {
			state.writePercent = percent;
		},
		setFolders(state, folders) {
			state.folders = folders;
		},
		setAlerts(state, alerts) {
			state.alerts = alerts;
		}
	},
	actions: {
		setUsedStorage(context, storage) {
			context.commit('setUsedStorage', storage);
		},
		setTotalStorage(context, storage) {
			context.commit('setTotalStorage', storage);
		},
		setReadPercent(context, percent) {
			context.commit('setReadPercent', percent);
		},
		setWritePercent(context, percent) {
			context.commit('setWritePercent', percent);
		},
		setFolders(context, folders) {
			context.commit('setFolders', folders);
		},
		setAlerts(context, alerts) {
			context.commit('setAlerts', alerts);
		}
	}
};