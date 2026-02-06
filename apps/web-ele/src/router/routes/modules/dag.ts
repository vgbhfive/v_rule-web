import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:network',
      keepAlive: true,
      order: 1006,
      title: $t('page.dag.title'),
    },
    name: 'DAGManagement',
    path: '/dag',
    children: [
      {
        meta: {
          title: $t('page.dag.dag'),
        },
        name: 'Dag',
        path: '/dag',
        component: () => import('#/views/dag/index.vue'),
      },
    ],
  },
];

export default routes;
