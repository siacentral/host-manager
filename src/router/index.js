import { createRouter, createWebHashHistory } from 'vue-router';

const routes = [
	{
		path: '/',
		name: 'dashboard',
		component: () => import(/* webpackChunkName: "dashboar" */ '../views/pages/Dashboard.vue')
	},
	{
		path: '/storage',
		name: 'storage',
		component: () => import(/* webpackChunkName: "storage" */ '../views/pages/Storage.vue')
	},
	{
		path: '/contracts',
		name: 'contracts',
		component: () => import(/* webpackChunkName: "contracts" */ '../views/pages/Contracts.vue')
	},
	{
		path: '/wallet',
		name: 'wallet',
		component: () => import(/* webpackChunkName: "wallet" */ '../views/pages/Wallet.vue')
	},
	{
		path: '/config',
		name: 'config',
		component: () => import(/* webpackChunkName: "config" */ '../views/pages/Config.vue')
	}
];

const router = createRouter({
	history: createWebHashHistory(),
	routes
});

export default router;
