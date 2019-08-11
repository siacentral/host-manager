import BigNumber from 'bignumber.js';

export default {
	namespaced: true,
	state: {
		usedStorage: new BigNumber(0),
		totalStorage: new BigNumber(0),
		readPercent: 0,
		writePercent: 0,
		folders: [],
		alerts: [],
		newAlertsCount: 0
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
			state.newAlertsCount = alerts.reduce((val, alert) => {
				const match = state.alerts.find(existing => existing.message === alert.message);

				if (match)
					return val;

				return val + 1;
			}, 0);

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