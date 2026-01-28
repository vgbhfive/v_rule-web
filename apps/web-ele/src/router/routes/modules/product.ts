import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ion:settings-outline',
      keepAlive: true,
      order: 1003,
      title: $t('page.product.title'),
    },
    name: 'Product',
    path: '/product',
    children: [
      {
        meta: {
          title: $t('page.product.interest'),
        },
        name: 'Interest',
        path: '/product/interest',
        component: () => import('#/views/product/interest/index.vue'),
      },
      {
        meta: {
          title: $t('page.product.period'),
        },
        name: 'Period',
        path: '/product/period',
        component: () => import('#/views/product/period/index.vue'),
      },
      {
        meta: {
          title: $t('page.product.limit'),
        },
        name: 'Limit',
        path: '/product/limit',
        component: () => import('#/views/product/limit/index.vue'),
      },
      {
        meta: {
          title: $t('page.product.custom'),
        },
        name: 'Custom',
        path: '/product/custom',
        component: () => import('#/views/product/custom/index.vue'),
      },
    ],
  },
];

export default routes;
