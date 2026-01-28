import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ion:settings-outline',
      keepAlive: true,
      order: 1001,
      title: $t('page.data.title'),
    },
    name: 'Data',
    path: '/data',
    children: [
      {
        meta: {
          title: $t('page.data.dataSource'),
        },
        name: 'DataSource',
        path: '/dataSource',
        component: () => import('#/views/data/dataSource/index.vue'),
      },
      {
        meta: {
          title: $t('page.data.dataCategory'),
        },
        name: 'DataCategory',
        path: '/dataCategory',
        component: () => import('#/views/data/dataCategory/index.vue'),
      },
    ],
  },
];

export default routes;
