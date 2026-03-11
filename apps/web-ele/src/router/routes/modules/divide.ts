import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:filter',
      keepAlive: true,
      order: 1005,
      title: $t('page.divide.title'),
    },
    sign: 'divide_data_manage',
    name: 'DivideManagement',
    path: '/divide',
    children: [
      {
        meta: {
          title: $t('page.divide.divide'),
        },
        sign: 'divide_data_manage',
        name: 'Divide',
        path: '/divide',
        component: () => import('#/views/divide/index.vue'),
      },
    ],
  },
];

export default routes;
