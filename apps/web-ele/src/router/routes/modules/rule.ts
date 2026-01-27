import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ion:settings-outline',
      keepAlive: true,
      order: 1001,
      title: $t('page.rule.title'),
    },
    name: 'RuleManagement',
    path: '/rule',
    children: [
      {
        meta: {
          title: $t('page.rule.rule'),
        },
        name: 'Rule',
        path: '/rule',
        component: () => import('#/views/rule/rule/index.vue'),
      },
      {
        meta: {
          title: $t('page.rule.ruleSet'),
        },
        name: 'RuleSet',
        path: '/ruleSet',
        component: () => import('#/views/rule/ruleSet/index.vue'),
      },
    ],
  },
];

export default routes;
