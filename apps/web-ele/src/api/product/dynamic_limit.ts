import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export interface DynamicLimitParams {
  lingNo: string;
  productName: string;
  productNo: string;
  isValid: number;
}

export interface DynamicLimitInfo {
  id: number;
  lineNo: string;
  productName: string;
  productNo: string;
  startLimitType: string;
  startLimit: string;
  endLimitType: string;
  endLimit: string;
  limitStepType: string;
  limitStep: string;
  remark: string;
  version: number;
  isValid: number;
  createAt: string;
}

/**
 * 获取动态额度产品列表
 */
export async function getDynamicLimitList(params: Recordable<any>) {
  return requestClient.post<DynamicLimitInfo[]>('/product/dynamic_limit/list', {
    ...params,
    type: 'dynamic_limit',
  });
}

/**
 * 创建动态额度产品
 * @param data
 * @returns
 */
export async function createDynamicLimit(data: Recordable<any>) {
  return requestClient.post('/product/dynamic_limit/create', data);
}

/**
 * 更新动态额度产品
 * @param data
 * @returns
 */
export async function updateDynamicLimit(data: Recordable<any>) {
  return requestClient.post('/product/dynamic_limit/update', data);
}

/**
 * 更新动态额度产品状态
 * @param params
 * @returns
 */
export async function updateDynamicLimitValid(params: Recordable<any>) {
  return requestClient.post('/product/dynamic_limit/valid', params);
}
