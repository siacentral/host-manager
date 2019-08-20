import BigNumber from 'bignumber.js';

export default {
	namespaced: true,
	state: {
		balance: new BigNumber(0),
		balanceDelta: new BigNumber(0),
		height: 0,
		rescanning: false,
		unlocked: false,
		encrypted: false,
		lastAddress: null,
		alerts: [],
		fees: {
			minimum: new BigNumber(0),
			maximum: new BigNumber(0)
		},
		newAlertsCount: 0
	},
	mutations: {
		setBalance(state, balance) {
			state.balance = balance;
		},
		setBalanceDelta(state, delta) {
			state.balanceDelta = delta;
		},
		setHeight(state, height) {
			state.height = height;
		},
		setUnlocked(state, unlocked) {
			state.unlocked = unlocked;
		},
		setEncrypted(state, encrypted) {
			state.encrypted = encrypted;
		},
		setRescanning(state, rescanning) {
			state.rescanning = rescanning;
		},
		setLastAddress(state, address) {
			state.lastAddress = address;
		},
		setFees(state, fees) {
			state.fees = { ...state.fees, ...fees };
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
		setBalance(context, balance) {
			context.commit('setBalance', balance);
		},
		setBalanceDelta(context, delta) {
			context.commit('setBalanceDelta', delta);
		},
		setHeight(context, height) {
			context.commit('setHeight', height);
		},
		setUnlocked(context, unlocked) {
			context.commit('setUnlocked', unlocked);
		},
		setEncrypted(context, encrypted) {
			context.commit('setEncrypted', encrypted);
		},
		setRescanning(context, rescanning) {
			context.commit('setRescanning', rescanning);
		},
		setLastAddress(context, address) {
			context.commit('setLastAddress', address);
		},
		setFees(context, fees) {
			context.commit('setFees', fees);
		},
		setAlerts(context, alerts) {
			context.commit('setAlerts', alerts);
		}
	}
};