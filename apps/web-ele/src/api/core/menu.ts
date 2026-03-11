import type { RouteRecordStringComponent, UserInfo } from '@vben/types';

import { requestClient } from '#/api/request';

/**
 * 获取用户所有菜单
 */
export async function getAllMenusApi(userInfo: UserInfo) {
  return requestClient.get<RouteRecordStringComponent[]>(
    `/user/operate/menu/${userInfo.id}`,
  );
}
