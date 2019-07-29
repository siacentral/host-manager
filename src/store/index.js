import Vue from 'vue';
import Vuex from 'vuex';
import { ipcRenderer } from 'electron';

import hostConnection from './connection';
import hostContracts from './contracts';
import hostConfig from './config';
import hostDaemon from './daemon';
import explorer from './explorer';
import hostStorage from './storage';
import hostWallet from './wallet';

Vue.use(Vuex);

export default new Vuex.Store({
	modules: {
		explorer,
		hostConnection,
		hostContracts,
		hostConfig,
		hostDaemon,
		hostStorage,
		hostWallet
	},
	state: {
		firstRun: true,
		config: null,
		netAddress: null,
		coinPrice: 0.00318536,
		blockHeight: 0,
		lastBlock: 0,
		synced: false,
		syncTime: 0,
		loaded: false,
		criticalError: null,
		alerts: [],
		notifications: []
	},
	mutations: {
		setFirstRun(state, firstRun) {
			state.firstRun = firstRun;
		},
		setCriticalError(state, criticalError) {
			state.criticalError = criticalError;
		},
		setLoaded(state, loaded) {
			state.loaded = loaded;
		},
		setNetAddress(state, netaddress) {
			state.netAddress = netaddress;
		},
		setConfig(state, value) {
			state.config = { ...state.config, ...value, dark_mode: true };
		},
		setCoinPrice(state, price) {
			state.coinPrice = price;
		},
		setBlockHeight(state, height) {
			state.blockHeight = height;
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
		}
	},
	actions: {
		setFirstRun(context, firstRun) {
			context.commit('setFirstRun', firstRun);
		},
		setLoaded(context, loaded) {
			context.commit('setLoaded', loaded);
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
		setBlockHeight(context, height) {
			context.commit('setBlockHeight', height);
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
		pushNotification(context, notification) {
			context.commit('pushNotification', notification);
		},
		clearNotification(context) {
			context.commit('clearNotification');
		}
	}
});
