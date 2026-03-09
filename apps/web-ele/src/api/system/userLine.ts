import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

/**
 * 获取用户业务线权限列表
 */
export async function getUserLineList(id: number) {
  return requestClient.post<string[]>(`/user/line/detail/${id}`);
}

/**
 * 更新用户业务线权限列表
 * @param params
 */
export async function updateUserLine(params: Recordable<any>) {
  return requestClient.post('/user/line/update', params);
}
