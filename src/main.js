import Vue from 'vue';
import log from 'electron-log';

import { promises as fs } from 'fs';
import App from './App.vue';
import router from './router';
import store from './store';
import { readConfig, checkSiaDataFolders, getConsensusPath } from '@/utils';
import { attachIPC } from '@/data/daemon';

import { library } from '@fortawesome/fontawesome-svg-core';
import { faFilter, faFastForward, faCopy, faSave, faBell, faBullhorn, faInfo, faFolder, faExternalLinkAlt, faWifi, faRedo, faCheckCircle, faWallet, faTimes,
	faChartPie, faHdd, faFileContract, faWrench, faCogs, faSearch,
	faUnlock, faDatabase, faPlus, faExpand, faTrash, faSync } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon, FontAwesomeLayers } from '@fortawesome/vue-fontawesome';

library.add(faFilter, faFastForward, faCopy, faSave, faBell, faBullhorn, faInfo, faFolder, faExternalLinkAlt, faWifi, faRedo, faCheckCircle, faWallet, faTimes, faChartPie,
	faHdd, faFileContract, faWrench, faCogs, faSearch, faUnlock,
	faDatabase, faPlus, faExpand, faTrash, faSync);

Vue.component('icon', FontAwesomeIcon);
Vue.component('icon-layers', FontAwesomeLayers);

Vue.config.productionTip = false;

process.on('unhandledRejection', error => {
	log.error(error);
});

async function init() {
	attachIPC();
	document.body.classList.add(process.platform);

	try {
		const config = await readConfig();

		if (typeof config.siad_data_path !== 'string' || config.siad_data_path.length === 0)
			throw new Error('siad_data_path missing');

		const stat = await fs.stat(config.siad_data_path);

		if (!stat || !stat.isDirectory())
			throw new Error('siad_data_path is not a directory');

		const missingFolders = await checkSiaDataFolders(getConsensusPath(config.siad_data_path));

		if (missingFolders.length > 0)
			throw new Error('data folder missing, running setup');

		store.dispatch('setConfig', config);

		document.body.classList.add('dark');

		store.dispatch('setup/setFirstRun', false);
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