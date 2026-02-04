import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:activity',
      keepAlive: true,
      order: 1007,
      title: $t('page.monitor.title'),
    },
    name: 'MonitorManagement',
    path: '/monitor',
    children: [
      {
        meta: {
          title: $t('page.monitor.sceneMonitor'),
        },
        name: 'SceneMonitor',
        path: '/monitor/scene',
        component: () => import('#/views/monitor/scene/index.vue'),
      },
      {
        meta: {
          title: $t('page.monitor.fieldMonitor'),
        },
        name: 'FieldMonitor',
        path: '/monitor/field',
        component: () => import('#/views/monitor/field/index.vue'),
      },
      {
        meta: {
          title: $t('page.monitor.reqIdMonitor'),
        },
        name: 'ReqIdMonitor',
        path: '/monitor/reqId',
        component: () => import('#/views/monitor/reqId/index.vue'),
      },
    ],
  },
];

export default routes;
