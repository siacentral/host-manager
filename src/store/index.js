import Vue from 'vue';
import Vuex from 'vuex';
import { ipcRenderer } from 'electron';

import hostContracts from './contracts';
import hostConfig from './config';
import hostDaemon from './daemon';
import explorer from './explorer';
import hostStorage from './storage';
import hostWallet from './wallet';
import setup from './setup';

Vue.use(Vuex);

const store = new Vuex.Store({
	strict: true,
	modules: {
		explorer,
		hostContracts,
		hostConfig,
		hostDaemon,
		hostStorage,
		hostWallet,
		setup
	},
	state: {
		config: null,
		netAddress: null,
		coinPrice: 0.00318536,
		block: {
			hash: null,
			height: 0
		},
		update: {
			available: false,
			ready: false,
			version: null
		},
		updateProgress: null,
		lastBlock: 0,
		synced: false,
		syncTime: 0,
		loaded: false,
		refreshingData: false,
		criticalError: null,
		notifications: [],
		alerts: [],
		newAlertsCount: 0
	},
	getters: {
		alerts(state) {
			let alerts = state.alerts.concat(state.hostStorage.alerts, state.hostContracts.alerts,
				state.hostWallet.alerts, state.hostConfig.alerts,
				state.explorer.alerts);

			alerts.sort((a, b) => {
				if (a.severity === 'danger' && a.severity !== b.severity)
					return -1;

				if (b.severity === 'danger' && a.severity !== b.severity)
					return 1;

				return 0;
			});

			return alerts;
		},
		newAlertsCount(state) {
			return state.newAlertsCount + state.hostStorage.newAlertsCount + state.hostContracts.newAlertsCount +
				state.hostWallet.newAlertsCount + state.hostConfig.newAlertsCount +
				state.explorer.newAlertsCount;
		}
	},
	mutations: {
		setAlerts(state, alerts) {
			state.newAlertsCount = alerts.reduce((val, alert) => {
				const match = state.alerts.find(existing => existing.message === alert.message);

				if (match)
					return val;

				return val + 1;
			}, 0);

			state.alerts = alerts;
		},
		setCriticalError(state, criticalError) {
			state.criticalError = criticalError;
		},
		setLoaded(state, loaded) {
			state.loaded = loaded;
		},
		setRefreshingData(state, refreshingData) {
			state.refreshingData = refreshingData;
		},
		setNetAddress(state, netaddress) {
			state.netAddress = netaddress;
		},
		setConfig(state, value) {
			state.config = { ...state.config, ...value, dark_mode: true };

			// we now display both fiat and SC on the same page so currency should not be set to SC
			if (typeof state.config.currency !== 'string' || state.config.currency === 'siacoin')
				state.config.currency = 'usd';
		},
		setCoinPrice(state, price) {
			state.coinPrice = price;
		},
		setBlock(state, block) {
			state.block = block;
		},
		setLastBlock(state, height) {
			state.lastBlock = height;
		},
		setSynced(state, synced) {
			state.synced = synced;
		},
		setSyncTime(state, time) {
			state.syncTime = time;
		},
		setUpdate(state, update) {
			state.update = update;
		},
		setUpdateProgress(state, progress) {
			state.updateProgress = progress;
		},
		pushNotification(state, notification) {
			state.notifications.push(notification);

			if (document.hidden) {
				const notify = new Notification(notification.message);

				notify.onclick = () => {
					ipcRenderer.send('show-window');
				};
			}
		},
		clearNotification(state) {
			if (state.notifications.length === 0)
				return;

			state.notifications.shift();
		},
		clearNewAlerts(state) {
			state.hostStorage.newAlertsCount = 0;
			state.hostContracts.newAlertsCount = 0;
			state.hostWallet.newAlertsCount = 0;
			state.hostConfig.newAlertsCount = 0;
			state.explorer.newAlertsCount = 0;
		}
	},
	actions: {
		setAlerts(context, alerts) {
			context.commit('setAlerts', alerts);
		},
		setLoaded(context, loaded) {
			context.commit('setLoaded', loaded);
		},
		setRefreshingData(context, refreshingData) {
			context.commit('setRefreshingData', refreshingData);
		},
		setCriticalError(context, criticalError) {
			context.commit('setCriticalError', criticalError);
		},
		setNetAddress(context, netaddress) {
			context.commit('setNetAddress', netaddress);
		},
		setConfig(context, value) {
			context.commit('setConfig', value);
		},
		setCoinPrice(context, price) {
			context.commit('setCoinPrice', price);
		},
		setBlock(context, block) {
			context.commit('setBlock', block);
		},
		setLastBlock(context, height) {
			context.commit('setLastBlock', height);
		},
		setSynced(context, synced) {
			context.commit('setSynced', synced);
		},
		setSyncTime(context, time) {
			context.commit('setSyncTime', time);
		},
		setUpdate(context, update) {
			context.commit('setUpdate', update);
		},
		setUpdateProgress(context, progress) {
			context.commit('setUpdateProgress', progress);
		},
		pushNotification(context, notification) {
			context.commit('pushNotification', notification);
		},
		clearNotification(context) {
			context.commit('clearNotification');
		},
		clearNewAlerts(context) {
			context.commit('clearNewAlerts');
		}
	}
});

ipcRenderer.on('statusUpdate', (ev, status) => {
	store.dispatch('hostDaemon/setLoaded', false);
	store.dispatch('hostDaemon/setLoadPercent', 0);
	store.dispatch('hostDaemon/setStatus', status);
});

export default store;