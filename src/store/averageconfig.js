import BigNumber from 'bignumber.js';

export default {
	namespaced: true,
	state: {
		avgMaxDuration: 0,
		avgWindowSize: 0,
		avgMaxReviseSize: new BigNumber(0),
		avgMaxDownloadSize: new BigNumber(0),
		avgContractPrice: new BigNumber(0),
		avgDownloadPrice: new BigNumber(0),
		avgUploadPrice: new BigNumber(0),
		avgStoragePrice: new BigNumber(0),
		avgCollateral: new BigNumber(0),
		avgMaxCollateral: new BigNumber(0),
		avgBaseRPCPrice: new BigNumber(0),
		avgSectorAccessPrice: new BigNumber(0)
	},
	mutations: {
		setMaxDuration(state, value) {
			state.avgMaxDuration = value;
		},
		setMaxReviseSize(state, value) {
			state.avgMaxReviseSize = value;
		},
		setMaxDownloadSize(state, value) {
			state.avgMaxDownloadSize = value;
		},
		setWindowSize(state, value) {
			state.avgWindowSize = value;
		},
		setContractPrice(state, value) {
			state.avgContractPrice = value;
		},
		setDownloadPrice(state, value) {
			state.avgDownloadPrice = value;
		},
		setUploadPrice(state, value) {
			state.avgUploadPrice = value;
		},
		setStoragePrice(state, value) {
			state.avgStoragePrice = value;
		},
		setCollateral(state, value) {
			state.avgCollateral = value;
		},
		setMaxCollateral(state, value) {
			state.avgMaxCollateral = value;
		},
		setBaseRPCPrice(state, value) {
			state.avgBaseRPCPrice = value;
		},
		setSectorAccessPrice(state, value) {
			state.avgSectorAccessPrice = value;
		}
	},
	actions: {
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
		setBaseRPCPrice(context, value) {
			context.commit('setBaseRPCPrice', value);
		},
		setSectorAccessPrice(context, value) {
			context.commit('setSectorAccessPrice', value);
		}
	}
};