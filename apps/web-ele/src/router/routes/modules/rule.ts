import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:git-branch',
      keepAlive: true,
      order: 1002,
      title: $t('page.rule.title'),
    },
    sign: 'rule_data_manage',
    name: 'RuleManagement',
    path: '/rule',
    children: [
      {
        meta: {
          title: $t('page.rule.rule'),
        },
        sign: 'rule_manage',
        name: 'Rule',
        path: '/rule',
        component: () => import('#/views/rule/rule/index.vue'),
      },
      {
        meta: {
          title: $t('page.rule.ruleSet'),
        },
        sign: 'rule_set_manage',
        name: 'RuleSet',
        path: '/ruleSet',
        component: () => import('#/views/rule/ruleSet/index.vue'),
      },
    ],
  },
];

export default routes;
