import Vue from 'vue';
import Router from 'vue-router';
import Store from './store';

import Dashboard from './views/Dashboard.vue';
import Storage from './views/Storage.vue';
import Contracts from './views/Contracts.vue';
import Config from './views/Config.vue';
import Setup from './views/Setup.vue';

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
		},
		{
			path: '/setup',
			name: 'setup',
			component: Setup,
			meta: {
				hide_navigation: true
			}
		}
	]
});

router.beforeEach((to, from, next) => {
	if (to.name !== 'setup' && Store.state.config === null)
		return next({ name: 'setup' });
	else if (to.name === 'setup' && Store.state.config !== null)
		return next({ name: 'dashboard' });

	next();
});

export default router;