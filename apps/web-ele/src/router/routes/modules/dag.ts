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
    sign: 'dag_manage',
    name: 'DAGManagement',
    path: '/dag',
    component: () => import('#/views/dag/index.vue'),
  },
];

export default routes;
