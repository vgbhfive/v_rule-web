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
export async function createScene(
  data: Omit<SceneInfo, 'createAt' | 'id' | 'updateAt'>,
) {
  return requestClient.post<SceneInfo>('/scene/create', data);
}

/**
 * 更新场景
 */
export async function updateScene(
  id: number,
  data: Omit<SceneInfo, 'createAt' | 'id' | 'updateAt'>,
) {
  return requestClient.put<SceneInfo>(`/scene/update/${id}`, data);
}

/**
 * 生效场景
 */
export async function validScene(id: number) {
  return requestClient.post<boolean>(`/scene/valid/${id}`);
}

/**
 * 失效场景
 */
export async function inValidScene(id: number) {
  return requestClient.post<boolean>(`/scene/invalid/${id}`);
}
