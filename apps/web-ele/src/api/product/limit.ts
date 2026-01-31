import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export interface LimitInfo {
  id: number;
  lineNo: string;
  productName: string;
  productNo: string;
  value: string;
  valueType: string;
  remark: string;
  version: number;
  isValid: number;
  createAt: string;
}

export interface LimitParams {
  lineNo: string;
  productName: string;
  productNo: string;
  isValid: number;
}

/**
 * 获取额度产品列表
 */
export async function getLimitList(params: Recordable<any>) {
  return requestClient.post<LimitInfo[]>('/product/limit/list', { ...params, type: 'limit' });
}

/**
 * 创建额度产品
 * @param params
 * @returns
 */
export async function createLimit(params: Recordable<any>) {
  return requestClient.post('/product/limit/create', params);
}

/**
 * 更新额度产品
 * @param params
 * @returns
 */
export async function updateLimit(params: Recordable<any>) {
  return requestClient.post('/product/limit/update', params);
}
