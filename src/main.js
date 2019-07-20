import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';

import { readConfig } from '@/utils';

import { library } from '@fortawesome/fontawesome-svg-core';
import { faWrench, faClock, faWifi, faExpand, faTrash, faCheckCircle, faCoins, faUser, faBell, faChartPie, faRedo, faFileContract, faCogs, faPencilAlt,
	faFolder, faTerminal, faLock, faDollarSign, faWallet, faServer, faExternalLinkAlt,
	faEllipsisV, faPlus, faMinus, faArrowsAltH, faBullhorn, faPowerOff, faPlay, faFire, faSync,
	faQuestionCircle, faExclamationCircle, faHdd, faSearch, faDatabase, faKey, faUnlock, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon, FontAwesomeLayers } from '@fortawesome/vue-fontawesome';

library.add(faWrench, faClock, faWifi, faExpand, faTrash, faCheckCircle, faCoins, faUser, faBell, faRedo, faChartPie, faFileContract, faCogs, faPencilAlt, faFolder, faTerminal,
	faLock, faDollarSign, faWallet, faServer, faExternalLinkAlt, faEllipsisV, faPlus, faMinus, faArrowsAltH, faBullhorn,
	faPowerOff, faPlay, faFire, faSync, faQuestionCircle, faExclamationCircle, faHdd, faSearch, faDatabase, faKey, faUnlock, faTimes);

Vue.component('icon', FontAwesomeIcon);
Vue.component('icon-layers', FontAwesomeLayers);

Vue.config.productionTip = false;

async function init() {
	try {
		const config = await readConfig();

		config.currency = 'usd';

		store.dispatch('setConfig', config);

		if (config.dark_mode)
			document.body.classList.add('dark');
		else
			document.body.classList.remove('dark');
	} catch (ex) {
		console.log(ex);
	}

	new Vue({
		router,
		store,
		render: h => h(App)
	}).$mount('#app');
}

init();