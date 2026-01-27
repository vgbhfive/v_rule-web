import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ion:settings-outline',
      keepAlive: true,
      order: 1003,
      title: $t('page.strategy.title'),
    },
    name: 'StrategyManagement',
    path: '/strategy',
    children: [
      {
        meta: {
          title: $t('page.strategy.strategy'),
        },
        name: 'Strategy',
        path: '/strategy',
        component: () => import('#/views/strategy/index.vue'),
      },
    ],
  },
];

export default routes;
