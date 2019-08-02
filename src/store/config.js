import BigNumber from 'bignumber.js';

export default {
	namespaced: true,
	state: {
		acceptingContracts: false,
		netaddress: '',
		maxDuration: 0,
		windowSize: 0,
		maxReviseSize: new BigNumber(0),
		maxDownloadSize: new BigNumber(0),
		contractPrice: new BigNumber(0),
		downloadPrice: new BigNumber(0),
		uploadPrice: new BigNumber(0),
		storagePrice: new BigNumber(0),
		collateral: new BigNumber(0),
		maxCollateral: new BigNumber(0),
		collateralBudget: new BigNumber(0),
		baseRPCPrice: new BigNumber(0),
		sectorAccessPrice: new BigNumber(0),
		alerts: [],
		newAlertsCount: 0
	},
	mutations: {
		setAlerts(state, alerts) {
			state.newAlertsCount = alerts.reduce((val, alert) => {
				const match = state.alerts.find(existing => existing.message === alert.message);

				if (match)
					return val;

				return val + 1;
			}, state.newAlertsCount);

			state.alerts = alerts;
		},
		setAcceptingContracts(state, value) {
			state.acceptingContracts = value;
		},
		setNetAddress(state, value) {
			state.netaddress = value;
		},
		setMaxDuration(state, value) {
			state.maxDuration = value;
		},
		setMaxReviseSize(state, value) {
			state.maxReviseSize = value;
		},
		setMaxDownloadSize(state, value) {
			state.maxDownloadSize = value;
		},
		setWindowSize(state, value) {
			state.windowSize = value;
		},
		setContractPrice(state, value) {
			state.contractPrice = value;
		},
		setDownloadPrice(state, value) {
			state.downloadPrice = value;
		},
		setUploadPrice(state, value) {
			state.uploadPrice = value;
		},
		setStoragePrice(state, value) {
			state.storagePrice = value;
		},
		setCollateral(state, value) {
			state.collateral = value;
		},
		setMaxCollateral(state, value) {
			state.maxCollateral = value;
		},
		setCollateralBudget(state, value) {
			state.collateralBudget = value;
		},
		setBaseRPCPrice(state, value) {
			state.baseRPCPrice = value;
		},
		setSectorAccessPrice(state, value) {
			state.sectorAccessPrice = value;
		}
	},
	actions: {
		setAlerts(context, alerts) {
			context.commit('setAlerts', alerts);
		},
		setAcceptingContracts(context, value) {
			context.commit('setAcceptingContracts', value);
		},
		setNetAddress(context, value) {
			context.commit('setNetAddress', value);
		},
		setMaxDuration(context, value) {
			context.commit('setMaxDuration', value);
		},
		setMaxReviseSize(context, value) {
			context.commit('setMaxReviseSize', value);
		},
		setMaxDownloadSize(context, value) {
			context.commit('setMaxDownloadSize', value);
		},
		setWindowSize(context, value) {
			context.commit('setWindowSize', value);
		},
		setContractPrice(context, value) {
			context.commit('setContractPrice', value);
		},
		setDownloadPrice(context, value) {
			context.commit('setDownloadPrice', value);
		},
		setUploadPrice(context, value) {
			context.commit('setUploadPrice', value);
		},
		setStoragePrice(context, value) {
			context.commit('setStoragePrice', value);
		},
		setCollateral(context, value) {
			context.commit('setCollateral', value);
		},
		setMaxCollateral(context, value) {
			context.commit('setMaxCollateral', value);
		},
		setCollateralBudget(context, value) {
			context.commit('setCollateralBudget', value);
		},
		setBaseRPCPrice(context, value) {
			context.commit('setBaseRPCPrice', value);
		},
		setSectorAccessPrice(context, value) {
			context.commit('setSectorAccessPrice', value);
		}
	}
};