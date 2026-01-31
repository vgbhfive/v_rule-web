import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export interface PeriodInfo {
  id: number;
  lineNo: string;
  productName: string;
  productNo: string;
  value: string;
  valueType: string;
  periodType: string;
  remark: string;
  version: number;
  isValid: number;
  createAt: string;
}

export interface PeriodParams {
  lineNo: string;
  productName: string;
  productNo: string;
  isValid: number;
}

/**
 * 获取账期产品列表
 */
export async function getPeriodList(params: Recordable<any>) {
  return requestClient.post<PeriodInfo[]>('/product/period/list', { ...params, type: 'period' });
}

/**
 * 创建额度产品
 * @param params
 * @returns
 */
export async function createPeriod(params: Recordable<any>) {
  return requestClient.post('/product/period/create', params);
}

/**
 * 更新额度产品
 * @param params
 * @returns
 */
export async function updatePeriod(params: Recordable<any>) {
  return requestClient.post('/product/period/update', params);
}

