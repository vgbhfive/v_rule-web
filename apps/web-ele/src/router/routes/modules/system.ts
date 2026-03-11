import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:settings',
      keepAlive: true,
      order: 1000,
      title: $t('page.system.title'),
    },
    sign: 'system_manage',
    name: 'System',
    path: '/system',
    children: [
      {
        meta: {
          title: $t('page.system.line'),
        },
        sign: 'line_manage',
        name: 'Line',
        path: '/line',
        component: () => import('#/views/system/line/index.vue'),
      },
      {
        meta: {
          title: $t('page.system.scene'),
        },
        sign: 'scene_manage',
        name: 'Scene',
        path: '/scene',
        component: () => import('#/views/system/scene/index.vue'),
      },
      {
        meta: {
          title: $t('page.system.user'),
        },
        sign: 'user_manage',
        name: 'User',
        path: '/user',
        component: () => import('#/views/system/user/index.vue'),
      },
      {
        meta: {
          title: $t('page.system.userLine'),
        },
        sign: 'user_line_manage',
        name: 'UserLine',
        path: '/user-line',
        component: () => import('#/views/system/userLine/index.vue'),
      },
      {
        meta: {
          title: $t('page.system.userOperate'),
        },
        sign: 'user_operate_manage',
        name: 'UserOperate',
        path: '/user-operate',
        component: () => import('#/views/system/userOperate/index.vue'),
      },
    ],
  },
];

export default routes;
