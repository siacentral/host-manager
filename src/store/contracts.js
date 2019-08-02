import { BigNumber } from 'bignumber.js';

export default {
	namespaced: true,
	state: {
		potentialRevenue: new BigNumber(0),
		earnedRevenue: new BigNumber(0),
		lostRevenue: new BigNumber(0),
		riskedCollateral: new BigNumber(0),
		lockedCollateral: new BigNumber(0),
		burntCollateral: new BigNumber(0),
		averageRevenue: new BigNumber(0),
		recentRevenue: new BigNumber(0),
		ongoingContracts: 0,
		successfulContracts: 0,
		failedContracts: 0,
		contracts: [],
		alerts: [],
		newAlertsCount: 0
	},
	mutations: {
		setPotentialRevenue(state, potentialRevenue) {
			state.potentialRevenue = potentialRevenue;
		},
		setEarnedRevenue(state, earnedRevenue) {
			state.earnedRevenue = earnedRevenue;
		},
		setLostRevenue(state, lostRevenue) {
			state.lostRevenue = lostRevenue;
		},
		setRiskedCollateral(state, riskedCollateral) {
			state.riskedCollateral = riskedCollateral;
		},
		setLockedCollateral(state, lockedCollateral) {
			state.lockedCollateral = lockedCollateral;
		},
		setBurntCollateral(state, burntCollateral) {
			state.burntCollateral = burntCollateral;
		},
		setAverageRevenue(state, averageRevenue) {
			state.averageRevenue = averageRevenue;
		},
		setRecentRevenue(state, recentRevenue) {
			state.recentRevenue = recentRevenue;
		},
		setOngoingContracts(state, ongoingContracts) {
			state.ongoingContracts = ongoingContracts;
		},
		setSuccessfulContracts(state, successfulContracts) {
			state.successfulContracts = successfulContracts;
		},
		setFailedContracts(state, failedContracts) {
			state.failedContracts = failedContracts;
		},
		setContracts(state, contracts) {
			state.contracts = contracts;
		},
		setAlerts(state, alerts) {
			state.newAlertsCount = alerts.reduce((val, alert) => {
				const match = state.alerts.find(existing => existing.message === alert.message);

				if (match)
					return val;

				return val + 1;
			}, state.newAlertsCount);

			state.alerts = alerts;
		}
	},
	actions: {
		setPotentialRevenue(context, potentialRevenue) {
			context.commit('setPotentialRevenue', potentialRevenue);
		},
		setEarnedRevenue(context, earnedRevenue) {
			context.commit('setEarnedRevenue', earnedRevenue);
		},
		setLostRevenue(context, lostRevenue) {
			context.commit('setLostRevenue', lostRevenue);
		},
		setRiskedCollateral(context, riskedCollateral) {
			context.commit('setRiskedCollateral', riskedCollateral);
		},
		setLockedCollateral(context, lockedCollateral) {
			context.commit('setLockedCollateral', lockedCollateral);
		},
		setBurntCollateral(context, burntCollateral) {
			context.commit('setBurntCollateral', burntCollateral);
		},
		setAverageRevenue(context, averageRevenue) {
			context.commit('setAverageRevenue', averageRevenue);
		},
		setRecentRevenue(context, recentRevenue) {
			context.commit('setRecentRevenue', recentRevenue);
		},
		setOngoingContracts(context, ongoingContracts) {
			context.commit('setOngoingContracts', ongoingContracts);
		},
		setSuccessfulContracts(context, successfulContracts) {
			context.commit('setSuccessfulContracts', successfulContracts);
		},
		setFailedContracts(context, failedContracts) {
			context.commit('setFailedContracts', failedContracts);
		},
		setContracts(context, contracts) {
			context.commit('setContracts', contracts);
		},
		setAlerts(context, alerts) {
			context.commit('setAlerts', alerts);
		}
	}
};