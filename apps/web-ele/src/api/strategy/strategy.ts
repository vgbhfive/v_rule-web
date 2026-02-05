import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export interface StrategyInfo {
  id: number;
  lineNo: string;
  sceneNo: string;
  strategyName: string;
  strategyNo: string;
  model: string;
  ruleDetailEntityList: StrategyDetailInfo[];
  version: number;
  isValid: number;
  createAt: string;
  deployAt?: string;
}

export interface StrategyParams {
  lineNo?: string;
  strategyName?: string;
  strategyNo?: string;
  isValid?: number;
}

export interface StrategyDetailInfo {
  detailNo: string;
  ruleType: string;
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
 * 创建策略集
 * @param params
 * @returns
 */
export async function createStrategy(params: Recordable<any>) {
  return requestClient.post(`/strategy/create`, params);
}

/**
 * 更新策略集
 * @param params
 * @returns
 */
export async function updateStrategy(params: Recordable<any>) {
  return requestClient.post(`/strategy/update`, params);
}

/**
 * 更新策略集状态
 * @param params
 * @returns
 */
export async function updateStrategyValid(params: Recordable<any>) {
  return requestClient.post(`/strategy/valid`, params);
}

/**
 * 获取策略集下拉列表
 * @param params
 * @returns
 */
export async function getStrategyDropdownList(params: Recordable<any>) {
  return requestClient.post<{ key: string; value: string }[]>(
    '/strategy/dropdown/list',
    params,
  );
}
