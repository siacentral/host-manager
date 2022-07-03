import BigNumber from 'bignumber.js';

export default {
	namespaced: true,
	state: {
		stats: {
			total: 0,
			active: 0,
			failed: 0,
			successful: 0,
			potentialRevenue: new BigNumber(0),
			earnedRevenue: new BigNumber(0),
			lostRevenue: new BigNumber(0),
			riskedCollateral: new BigNumber(0),
			lockedCollateral: new BigNumber(0),
			burntCollateral: new BigNumber(0)
		},
		alerts: [],
		snapshots: {},
		newAlertsCount: 0,
		pendingPayouts: new BigNumber(0)
	},
	mutations: {
		setStats(state, stats) {
			state.stats = stats;
		},
		setSnapshots(state, snapshots) {
			state.snapshots = snapshots;
		},
		setAlerts(state, alerts) {
			state.newAlertsCount = alerts.reduce((val, alert) => {
				const match = state.alerts.find(existing => existing.id ? existing.id === alert.id : existing.message === alert.message);

				if (match)
					return val;

				return val + 1;
			}, 0);

			state.alerts = alerts;
		},
		setPendingPayouts(state, payout) {
			state.pendingPayouts = payout;
		}
	},
	actions: {
		setStats(context, stats) {
			context.commit('setStats', stats);
		},
		setSnapshots(context, snapshots) {
			context.commit('setSnapshots', snapshots);
		},
		setAlerts(context, alerts) {
			context.commit('setAlerts', alerts);
		},
		setPendingPayouts({ commit }, payout) {
			commit('setPendingPayouts', payout);
		}
	},
	getters: {
		snapshots(state) {
			const keys = Object.keys(state.snapshots),
				snapshots = [];

			keys.forEach(k => {
				snapshots.push(state.snapshots[k]);
			});

			snapshots.sort((a, b) => a.timestamp.getTime() > b.timestamp.getTime() ? 1 : a.timestamp.getTime() < b.timestamp.getTime() ? -1 : 0);

			return snapshots;
		}
	}
};