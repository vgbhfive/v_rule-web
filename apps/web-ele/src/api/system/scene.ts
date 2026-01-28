import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export interface SceneInfo {
  id: number;
  lineNo: string;
  sceneName: string;
  sceneNo: string;
  field: string;
  isValid: number;
  createAt: string;
  updateAt: string;
}

export interface SceneParams {
  lineNo?: string;
  sceneName?: string;
  field?: string;
  sceneNo?: string;
  isValid?: number;
}

/**
 * 获取场景列表
 */
export async function getSceneList(param: SceneParams) {
  return requestClient.post<{ items: SceneInfo[]; total: number }>(
    '/scene/list',
    param,
  );
}

/**
 * 获取场景详情
 */
export async function getSceneDetail(id: number) {
  return requestClient.get<SceneInfo>(`/scene/detail/${id}`);
}

/**
 * 创建场景
 */
export async function createScene(params: Recordable<any>) {
  return requestClient.post('/scene/create', params);
}

/**
 * 更新场景
 */
export async function updateScene(params: Recordable<any>) {
  return requestClient.post(`/scene/update`, params);
}

/**
 * 生效/失效场景
 */
export async function updateSceneValid(params: Recordable<any>) {
  return requestClient.post(`/scene/valid`, params);
}
