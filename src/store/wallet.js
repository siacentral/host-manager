import BigNumber from 'bignumber.js';

export default {
	namespaced: true,
	state: {
		balance: new BigNumber(0),
		balanceDelta: new BigNumber(0),
		unlocked: false
	},
	mutations: {
		setBalance(state, balance) {
			state.balance = balance;
		},
		setBalanceDelta(state, delta) {
			state.balanceDelta = delta;
		},
		setUnlocked(state, unlocked) {
			state.unlocked = unlocked;
		}
	},
	actions: {
		setBalance(context, balance) {
			context.commit('setBalance', balance);
		},
		setBalanceDelta(context, delta) {
			context.commit('setBalanceDelta', delta);
		},
		setUnlocked(context, unlocked) {
			context.commit('setUnlocked', unlocked);
		}
	}
};