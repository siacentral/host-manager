import Vue from 'vue';
import Router from 'vue-router';

import Dashboard from './views/pages/Dashboard.vue';
import Storage from './views/pages/Storage.vue';
import Contracts from './views/pages/Contracts.vue';
import Config from './views/pages/Config.vue';

Vue.use(Router);

const router = new Router({
	mode: 'hash',
	base: process.env.BASE_URL,
	routes: [
		{
			path: '/',
			name: 'dashboard',
			component: Dashboard
		},
		{
			path: '/storage',
			name: 'storage',
			component: Storage
		},
		{
			path: '/contracts',
			name: 'contracts',
			component: Contracts
		},
		{
			path: '/config',
			name: 'config',
			component: Config
		}
	]
});

export default router;