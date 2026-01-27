import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ion:settings-outline',
      keepAlive: true,
      order: 1003,
      title: $t('page.divide.title'),
    },
    name: 'DivideManagement',
    path: '/divide',
    children: [
      {
        meta: {
          title: $t('page.divide.divide'),
        },
        name: 'Divide',
        path: '/divide',
        component: () => import('#/views/divide/index.vue'),
      },
    ],
  },
];

export default routes;
