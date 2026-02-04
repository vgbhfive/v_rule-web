import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export interface InterestInfo {
  id: number;
  lineNo: string;
  productName: string;
  productNo: string;
  value: string;
  valueType: string;
  unit: string;
  remark: string;
  version: number;
  isValid: number;
  createAt: string;
}

export interface InterestParams {
  lineNo: string;
  productNo: string;
}

/**
 * 获取利率产品列表
 */
export async function getInterestList(params: Recordable<any>) {
  return requestClient.post<InterestInfo[]>('/product/interest/list', {
    ...params,
    type: 'interest',
  });
}

/**
 * 创建利率产品
 * @param params
 * @returns
 */
export async function createInterest(params: Recordable<any>) {
  return requestClient.post('/product/interest/create', params);
}

/**
 * 更新利率产品
 * @param params
 * @returns
 */
export async function updateInterest(params: Recordable<any>) {
  return requestClient.post('/product/interest/update', params);
}
