import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export interface CustomInfo {
  id: number;
  lineNo: string;
  productName: string;
  productNo: string;
  remark: string;
  version: number;
  isValid: number;
  createAt: string;
}

export interface CustomParams {
  lineNo?: string;
  productName?: string;
  productNo?: string;
  isValid?: number;
}

/**
 * 获取自定义产品列表
 */
export async function getCustomList(params: Recordable<any>) {
  return requestClient.post<CustomInfo[]>('/product/custom/list', { ...params, type: 'custom' });
}
