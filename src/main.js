import Vue from 'vue';
import log from 'electron-log';

import App from './App.vue';
import router from './router';
import store from './store';
import { readConfig } from '@/utils';
import { attachDaemonIPC } from '@/sync/daemon';
import { attachUpdateIPC } from '@/sync/autoupdate';

import { library } from '@fortawesome/fontawesome-svg-core';
import { faEllipsisH, faDownload, faChevronUp, faChevronDown, faChevronLeft, faChevronRight, faCoins, faUpload, faFilter, faFastForward, faCopy, faSave, faBell, faBullhorn, faInfo, faFolder, faExternalLinkAlt, faWifi, faRedo, faCheckCircle, faWallet, faTimes,
	faChartPie, faHdd, faFileContract, faWrench, faCogs, faSearch,
	faUnlock, faDatabase, faPlus, faExpand, faTrash, faSync } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon, FontAwesomeLayers } from '@fortawesome/vue-fontawesome';

library.add(faEllipsisH, faDownload, faChevronUp, faChevronDown, faChevronLeft, faChevronRight, faCoins, faUpload, faFilter, faFastForward, faCopy, faSave, faBell, faBullhorn, faInfo, faFolder, faExternalLinkAlt, faWifi, faRedo, faCheckCircle, faWallet, faTimes, faChartPie,
	faHdd, faFileContract, faWrench, faCogs, faSearch, faUnlock,
	faDatabase, faPlus, faExpand, faTrash, faSync);

Vue.component('icon', FontAwesomeIcon);
Vue.component('icon-layers', FontAwesomeLayers);

Vue.config.productionTip = false;
Vue.config.devtools = false;

process.on('unhandledRejection', error => {
	log.error(error);
});

Vue.mixin({
	methods: {
		pushNotification(notification) {
			store.dispatch('pushNotification', notification);
		}
	}
});

async function init() {
	attachDaemonIPC();
	attachUpdateIPC();

	document.body.classList.add(process.platform);

	try {
		const config = await readConfig();

		if (typeof config.siad_data_path !== 'string' || config.siad_data_path.length === 0) {
			store.dispatch('pushNotification', {
				message: `Config appears to be corrupt, running setup.`,
				icon: 'folder',
				severity: 'danger'
			});
			throw new Error('siad_data_path missing');
		}

		store.dispatch('setConfig', config);

		document.body.classList.add('dark');

		console.log('first run false');
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