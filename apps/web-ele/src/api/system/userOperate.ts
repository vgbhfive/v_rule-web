import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export interface operatePermission {
  id: number;
  name: string;
  uniqueSign: string;
  type: number;
  parentId: number;
  children?: operatePermission[];
  checked?: boolean;
  indeterminate?: boolean;
}

/**
 * 获取用户操作权限列表
 * @returns
 */
export async function getOperatePermissionList() {
  return requestClient.get<operatePermission[]>('/user/operate/list');
}

/**
 * 获取用户操作权限列表
 */
export async function getUserOperateList(id: number) {
  return requestClient.post<number[]>(`/user/operate/detail/${id}`);
}

/**
 * 更新用户操作权限列表
 * @param params
 */
export async function updateUserOperate(params: Recordable<any>) {
  return requestClient.post('/user/operate/update', params);
}
