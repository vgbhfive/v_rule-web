import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export interface StrategyInfo {
  id: number;
  lineNo: string;
  sceneNo: string;
  strategyName: string;
  strategyNo: string;
  model: string;
  version: number;
  isValid: number;
  createAt: string;
}

export interface StrategyParams {
  lineNo?: string;
  strategyName?: string;
  strategyNo?: string;
  isValid?: number;
}

/**
 * 获取策略集列表
 */
export async function getStrategyList(param: StrategyParams) {
  return requestClient.post<{ items: StrategyInfo[]; total: number }>(
    '/strategy/list',
    param,
  );
}

/**
 * 获取策略集详情
 * @param id 
 * @returns 
 */
export async function getStrategyDetail(id: number) {
  return requestClient.get<StrategyInfo>(`/strategy/detail/${id}`);
}

/**
 * 更新策略集状态
 * @param params 
 * @returns 
 */
export async function updateStrategyValid(params: Recordable<any>) {
  return requestClient.post(`/strategy/valid`, params);
}
