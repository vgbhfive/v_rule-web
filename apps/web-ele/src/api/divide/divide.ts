import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export interface DivideInfo {
  id: number;
  lineNo: string;
  sceneNo: string;
  divideName: string;
  divideNo: string;
  accessStrategyNo: string;
  riskStrategyNo: string;
  priority: number;
  version: number;
  isValid: number;
  createAt: string;
  deployAt?: string;
}

export interface DivideParams {
  lineNo?: string;
  sceneNo: string;
  divideName: string;
  divideNo: string;
  isValid?: number;
}

export interface ProductEntityInfo {
  divideNo: string;
  type: string;
  productNo: string;
}

export interface DivideDetailInfo extends DivideInfo {
  productEntityList?: ProductEntityInfo[];
}

/**
 * 获取分流器列表
 * @param param
 * @returns
 */
export async function getDivideList(param: DivideParams) {
  return requestClient.post<{ items: DivideInfo[]; total: number }>(
    '/divide/list',
    param,
  );
}

export async function getDivideDetail(id: number) {
  return requestClient.get(`/divide/detail/${id}`);
}

/**
 * 创建分流器
 * @param params
 * @returns
 */
export async function createDivide(params: Recordable<any>) {
  return requestClient.post(`/divide/create`, params);
}

/**
 * 更新分流器
 * @param params
 * @returns
 */
export async function updateDivide(params: Recordable<any>) {
  return requestClient.post(`/divide/update`, params);
}

/**
 * 更新分流器状态
 * @param params
 * @returns
 */
export async function updateDivideValid(params: Recordable<any>) {
  return requestClient.post(`/divide/valid`, params);
}
