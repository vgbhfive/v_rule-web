import type { Router, RouteRecordRaw } from 'vue-router';

import { LOGIN_PATH } from '@vben/constants';
import { preferences } from '@vben/preferences';
import { useAccessStore } from '@vben/stores';
import { startProgress, stopProgress } from '@vben/utils';

import { accessRoutes, coreRouteNames } from '#/router/routes';
import { useAuthStore } from '#/store';

import { generateAccess } from './access';

/**
 * 通用守卫配置
 * @param router
 */
function setupCommonGuard(router: Router) {
  // 记录已经加载的页面
  const loadedPaths = new Set<string>();

  router.beforeEach((to) => {
    to.meta.loaded = loadedPaths.has(to.path);

    // 页面加载进度条
    if (!to.meta.loaded && preferences.transition.progress) {
      startProgress();
    }
    return true;
  });

  router.afterEach((to) => {
    // 记录页面是否加载,如果已经加载，后续的页面切换动画等效果不在重复执行

    loadedPaths.add(to.path);

    // 关闭页面加载进度条
    if (preferences.transition.progress) {
      stopProgress();
    }
  });
}

/**
 * 根据权限递归过滤路由
 * @param routes 待过滤的路由
 * @param permissions 用户的权限标识列表
 */
function filterRoutesByPermission(
  routes: RouteRecordRaw[],
  permissions: string[],
  isAdmin: boolean,
): RouteRecordRaw[] {
  if (isAdmin) {
    return routes;
  }
  if (!permissions || permissions.length === 0) {
    return []; // 如果用户没有任何页面权限，则返回空数组
  }

  const accessible: RouteRecordRaw[] = [];
  for (const route of routes) {
    const routeCopy = { ...route };
    // 检查当前路由是否有权限
    const hasPermission =
      routeCopy.sign && permissions.includes(routeCopy.sign as string);

    // 如果有子路由，递归过滤子路由
    if (routeCopy.children) {
      routeCopy.children = filterRoutesByPermission(
        routeCopy.children,
        permissions,
        isAdmin,
      );
    }

    // 如果路由本身有权限，或者其子路由经过滤后仍有剩余，则保留该路由
    if (
      hasPermission ||
      (routeCopy.children && routeCopy.children.length > 0)
    ) {
      accessible.push(routeCopy);
    }
  }
  return accessible;
}

/**
 * 权限访问守卫配置
 * @param router
 */
function setupAccessGuard(router: Router) {
  router.beforeEach(async (to, from) => {
    const accessStore = useAccessStore();
    const authStore = useAuthStore();

    // 基本路由，这些路由不需要进入权限拦截
    if (coreRouteNames.includes(to.name as string)) {
      if (to.path === LOGIN_PATH && accessStore.accessToken) {
        return decodeURIComponent(
          (to.query?.redirect as string) || preferences.app.defaultHomePath,
        );
      }
      return true;
    }

    // accessToken 检查
    if (!accessStore.accessToken) {
      // 明确声明忽略权限访问权限，则可以访问
      if (to.meta.ignoreAccess) {
        return true;
      }

      // 没有访问权限，跳转登录页面
      if (to.fullPath !== LOGIN_PATH) {
        return {
          path: LOGIN_PATH,
          // 如不需要，直接删除 query
          query:
            to.fullPath === preferences.app.defaultHomePath
              ? {}
              : { redirect: encodeURIComponent(to.fullPath) },
          // 携带当前跳转的页面，登录后重新跳转该页面
          replace: true,
        };
      }
      return to;
    }

    // 是否已经生成过动态路由
    if (accessStore.isAccessChecked) {
      return true;
    }

    // 更新用户信息
    const userInfo = await authStore.fetchUserInfo();

    // 根据用户的 pagePermission 权限码，递归筛选可访问的路由
    const filteredAccessRoutes = filterRoutesByPermission(
      accessRoutes,
      userInfo.pagePermission || [],
      userInfo.email === 'admin',
    );

    // 生成菜单和路由
    const { accessibleMenus, accessibleRoutes } = await generateAccess({
      roles: [], // 路由表,当前登录用户拥有的角色标识列表
      router,
      // 则会在菜单中显示，但是访问会被重定向到403
      routes: filteredAccessRoutes,
      userInfo,
    });

    // 保存菜单信息和路由信息
    accessStore.setAccessMenus(accessibleMenus);
    accessStore.setAccessRoutes(accessibleRoutes);
    accessStore.setIsAccessChecked(true);
    const redirectPath = (from.query.redirect ??
      (to.path === preferences.app.defaultHomePath
        ? preferences.app.defaultHomePath
        : to.fullPath)) as string;

    return {
      ...router.resolve(decodeURIComponent(redirectPath)),
      replace: true,
    };
  });
}

/**
 * 项目守卫配置
 * @param router
 */
function createRouterGuard(router: Router) {
  /** 通用 */
  setupCommonGuard(router);
  /** 权限访问 */
  setupAccessGuard(router);
}

export { createRouterGuard };
