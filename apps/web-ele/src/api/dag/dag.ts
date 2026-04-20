import { requestClient } from '#/api/request';

export interface DagInfoParams {
  lineNo: string;
  sceneNo: string;
}

/**
 * 获取场景DAG信息
 * @returns
 */
export async function getSceneDagInfo(param: DagInfoParams) {
  return requestClient.post('/dag/info', param);
}
