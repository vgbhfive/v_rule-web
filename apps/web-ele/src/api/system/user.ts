import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export interface UserInfo {
  id: number;
  name: string;
  mobile: string;
  email: string;
  status: number;
  isValid: number;
  createAt: string;
  updateAt: string;
}

export interface UserParams {
  name?: string;
  mobile?: string;
  email?: string;
  status?: number;
  isValid?: number;
}

/**
 * 获取用户列表
 */
export async function getUserList(param: UserParams) {
  return requestClient.post<{ items: UserInfo[]; total: number }>(
    '/user/list',
    param,
  );
}

/**
 * 创建用户
 */
export async function createUser(params: Recordable<any>) {
  return requestClient.post('/user/register', params);
}

/**
 * 更新用户
 */
export async function updateUser(params: Recordable<any>) {
  return requestClient.post('/user/update', params);
}

/**
 * 修改用户状态
 */
export async function updateUserValid(params: Recordable<any>) {
  return requestClient.post(`/user/valid`, params);
}

/**
 * 重置用户密码
 */
export async function resetPassword(params: Recordable<any>) {
  return requestClient.post(`/user/resetPassword`, params);
}

/**
 * 冻结用户
 */
export async function freeze(params: Recordable<any>) {
  return requestClient.post(`/user/freeze`, params);
}

/**
 * 恢复用户
 */
export async function normal(params: Recordable<any>) {
  return requestClient.post(`/user/normal`, params);
}
