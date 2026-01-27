import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ion:settings-outline',
      keepAlive: true,
      order: 1000,
      title: $t('page.system.title'),
    },
    name: 'System',
    path: '/system',
    children: [
      {
        meta: {
          title: $t('page.system.line'),
        },
        name: 'Line',
        path: '/system/line',
        component: () => import('#/views/system/line/index.vue'),
      },
      {
        meta: {
          title: $t('page.system.scene'),
        },
        name: 'Scene',
        path: '/system/scene',
        component: () => import('#/views/system/scene/index.vue'),
      },
      {
        meta: {
          title: $t('page.system.dataSource'),
        },
        name: 'DataSource',
        path: '/system/dataSource',
        component: () => import('#/views/system/dataSource/index.vue'),
      },
      {
        meta: {
          title: $t('page.system.dataCategory'),
        },
        name: 'DataCategory',
        path: '/system/dataCategory',
        component: () => import('#/views/system/dataCategory/index.vue'),
      },
    ],
  },
];

export default routes;
