import { createApp } from 'vue';
import log from 'electron-log';

import App from './App.vue';
import router from './router';
import store from './store';

import { attachDaemonIPC } from '@/sync/daemon';
import { attachUpdateIPC } from '@/sync/autoupdate';

import { library } from '@fortawesome/fontawesome-svg-core';
import {
	faEllipsisH, faDownload, faChevronUp, faChevronDown, faChevronLeft, faChevronRight, faCoins, faUpload, faFilter, faFastForward, faCopy, faSave, faBell, faBullhorn, faInfo, faFolder, faExternalLinkAlt, faWifi, faRedo, faCheckCircle, faWallet, faTimes,
	faChartPie, faHdd, faFileContract, faWrench, faCogs, faSearch,
	faUnlock, faDatabase, faPlus, faExpand, faTrash, faSync
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

library.add(faEllipsisH, faDownload, faChevronUp, faChevronDown, faChevronLeft, faChevronRight, faCoins, faUpload, faFilter, faFastForward, faCopy, faSave, faBell, faBullhorn, faInfo, faFolder, faExternalLinkAlt, faWifi, faRedo, faCheckCircle, faWallet, faTimes, faChartPie,
	faHdd, faFileContract, faWrench, faCogs, faSearch, faUnlock,
	faDatabase, faPlus, faExpand, faTrash, faSync);

process.on('unhandledRejection', error => {
	log.error(error);
});

attachDaemonIPC();
attachUpdateIPC();

createApp(App)
	.use(store)
	.use(router)
	.component('icon', FontAwesomeIcon)
	.mixin({
		methods: {
			pushNotification(notification) {
				store.dispatch('pushNotification', notification);
			}
		}
	})
	.mount('#app');
