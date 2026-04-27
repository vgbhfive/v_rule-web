import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export interface DynamicPeriodParams {
  lineNo: string;
  productName: string;
  productNo: string;
  isValid: number;
}

export interface DynamicPeriodInfo {
  id: number;
  lineNo: string;
  productName: string;
  productNo: string;
  startPeriodType: string;
  startPeriod: string;
  endPeriodType: string;
  endPeriod: string;
  periodStepType: string;
  periodStep: string;
  periodType: string;
  remark: string;
  version: number;
  isValid: number;
  createAt: string;
}

/**
 * 获取动态账期产品列表
 */
export async function getDynamicPeriodList(params: Recordable<any>) {
  return requestClient.post<DynamicPeriodInfo[]>(
    '/product/dynamic_period/list',
    {
      ...params,
      type: 'dynamic_period',
    },
  );
}

/**
 * 创建动态账期产品
 * @param data
 * @returns
 */
export async function createDynamicPeriod(data: Recordable<any>) {
  return requestClient.post('/product/dynamic_period/create', data);
}

/**
 * 更新动态账期产品
 * @param data
 * @returns
 */
export async function updateDynamicPeriod(data: Recordable<any>) {
  return requestClient.post('/product/dynamic_period/update', data);
}

/**
 * 更新动态账期产品状态
 * @param params
 * @returns
 */
export async function updateDynamicPeriodValid(params: Recordable<any>) {
  return requestClient.post('/product/dynamic_period/valid', params);
}
