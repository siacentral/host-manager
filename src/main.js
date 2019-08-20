import Vue from 'vue';
import log from 'electron-log';
import path from 'path';

import App from './App.vue';
import router from './router';
import store from './store';
import { readConfig, dirExistsAsync, getUserDataPath } from '@/utils';

import { library } from '@fortawesome/fontawesome-svg-core';
import { faCopy, faSave, faBell, faBullhorn, faInfo, faFolder, faExternalLinkAlt, faWifi, faRedo, faCheckCircle, faWallet, faTimes,
	faChartPie, faHdd, faFileContract, faWrench, faCogs, faSearch,
	faUnlock, faDatabase, faPlus, faExpand, faTrash, faSync } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon, FontAwesomeLayers } from '@fortawesome/vue-fontawesome';

library.add(faCopy, faSave, faBell, faBullhorn, faInfo, faFolder, faExternalLinkAlt, faWifi, faRedo, faCheckCircle, faWallet, faTimes, faChartPie,
	faHdd, faFileContract, faWrench, faCogs, faSearch, faUnlock,
	faDatabase, faPlus, faExpand, faTrash, faSync);

Vue.component('icon', FontAwesomeIcon);
Vue.component('icon-layers', FontAwesomeLayers);

Vue.config.productionTip = false;

process.on('unhandledRejection', error => {
	log.error(error);
});

function getConsensusPath(config) {
	if (config.siad_data_path)
		return config.siad_data_path;

	return path.join(getUserDataPath('Sia-UI'), 'sia');
}

// checks to make sure all of Sia's consensus directories exist at the specified location
async function checkSiaFolders(config) {
	const consensusFoldersExist = (await Promise.all([
		dirExistsAsync(path.join(getConsensusPath(config), 'consensus')),
		dirExistsAsync(path.join(getConsensusPath(config), 'gateway')),
		dirExistsAsync(path.join(getConsensusPath(config), 'host')),
		dirExistsAsync(path.join(getConsensusPath(config), 'renter')),
		dirExistsAsync(path.join(getConsensusPath(config), 'transactionpool')),
		dirExistsAsync(path.join(getConsensusPath(config), 'wallet'))
	])).filter(f => !f);

	return consensusFoldersExist.length === 0;
}

async function init() {
	document.body.classList.add(process.platform);

	try {
		const config = await readConfig();

		if (!(await checkSiaFolders(config)))
			throw new Error('consensus folder missing, running setup');

		store.dispatch('setConfig', config);

		if (config.dark_mode)
			document.body.classList.add('dark');
		else
			document.body.classList.remove('dark');

		store.dispatch('setFirstRun', false);
	} catch (ex) {
		log.error('main init', ex.message);
	}

	new Vue({
		router,
		store,
		render: h => h(App)
	}).$mount('#app');
}

init();