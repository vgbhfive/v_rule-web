import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:rocket',
      keepAlive: true,
      order: 1007,
      title: $t('page.deploy.title'),
    },
    name: 'DeployManagement',
    path: '/deploy',
    children: [
      {
        meta: {
          title: $t('page.deploy.deploy'),
        },
        name: 'Deploy',
        path: '/deploy',
        component: () => import('#/views/deploy/index.vue'),
      },
    ],
  },
];

export default routes;
