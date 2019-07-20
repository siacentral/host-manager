import Vue from 'vue';
import Vuex from 'vuex';

import { writeConfig } from '@/utils';

import hostConnection from './connection';
import hostContracts from './contracts';
import hostConfig from './config';
import avgConfig from './averageconfig';
import hostStorage from './storage';
import hostWallet from './wallet';

Vue.use(Vuex);

const defaultConfig = {
	siad_api_agent: 'Sia-Agent',
	siad_api_addr: 'localhost:9980'
};

export default new Vuex.Store({
	modules: {
		avgConfig,
		hostConnection,
		hostContracts,
		hostConfig,
		hostStorage,
		hostWallet
	},
	state: {
		config: null,
		netAddress: null,
		coinPrice: 0.00318536,
		blockHeight: 0,
		lastBlock: 0,
		synced: false,
		syncTime: 0,
		loaded: false,
		alerts: [],
		notifications: []
	},
	mutations: {
		setLoaded(state, loaded) {
			state.loaded = loaded;
		},
		setNetAddress(state, netaddress) {
			state.netAddress = netaddress;
		},
		setConfig(state, value) {
			state.config = { ...defaultConfig, ...state.config, ...value };
			writeConfig(state.config);
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
			console.log('adding notification', notification);
			state.notifications.push(notification);
		},
		clearNotification(state) {
			if (state.notifications.length === 0)
				return;

			state.notifications.shift();
		}
	},
	actions: {
		setLoaded(context, loaded) {
			context.commit('setLoaded', loaded);
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
