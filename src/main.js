import Vue from 'vue';
import log from 'electron-log';

import App from './App.vue';
import router from './router';
import store from './store';
import { readConfig } from '@/utils';

import { library } from '@fortawesome/fontawesome-svg-core';
import { faBell, faBullhorn, faInfo, faFolder, faExternalLinkAlt, faWifi, faRedo, faCheckCircle, faWallet, faTimes,
	faChartPie, faHdd, faFileContract, faWrench, faCogs, faSearch,
	faUnlock, faDatabase, faPlus, faExpand, faTrash, faSync } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon, FontAwesomeLayers } from '@fortawesome/vue-fontawesome';

library.add(faBell, faBullhorn, faInfo, faFolder, faExternalLinkAlt, faWifi, faRedo, faCheckCircle, faWallet, faTimes, faChartPie,
	faHdd, faFileContract, faWrench, faCogs, faSearch, faUnlock,
	faDatabase, faPlus, faExpand, faTrash, faSync);

Vue.component('icon', FontAwesomeIcon);
Vue.component('icon-layers', FontAwesomeLayers);

Vue.config.productionTip = false;

process.on('unhandledRejection', error => {
	log.error(error);
});

async function init() {
	document.body.classList.add(process.platform);

	try {
		const config = await readConfig();

		store.dispatch('setConfig', config);

		if (config.dark_mode)
			document.body.classList.add('dark');
		else
			document.body.classList.remove('dark');

		store.dispatch('setFirstRun', false);
	} catch (ex) {
		log.error(ex.message);
	}

	new Vue({
		router,
		store,
		render: h => h(App)
	}).$mount('#app');
}

init();