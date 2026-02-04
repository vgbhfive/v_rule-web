import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export interface CustomInfo {
  id: number;
  lineNo: string;
  productName: string;
  productNo: string;
  productCustomEntityList: DetailList[];
  remark: string;
  version: number;
  isValid: string;
  createAt: string;
}

export interface CustomParams {
  lineNo?: string;
  productName?: string;
  productNo?: string;
  isValid?: number;
}

export interface DetailList {
  keyName: string;
  value: string;
  valueType: string;
}

/**
 * 获取自定义产品列表
 */
export async function getCustomList(params: Recordable<any>) {
  return requestClient.post<CustomInfo[]>('/product/custom/list', {
    ...params,
    type: 'custom',
  });
}

/**
 * 获取自定义产品详情
 * @param id
 * @returns
 */
export async function customDetail(id: number) {
  return requestClient.get(`/product/custom/detail/${id}`);
}

/**
 * 创建自定义产品
 * @param params
 * @returns
 */
export async function createCustom(params: Recordable<any>) {
  return requestClient.post('/product/custom/create', params);
}

/**
 * 更新自定义产品
 * @param params
 * @returns
 */
export async function updateCustom(params: Recordable<any>) {
  return requestClient.post('/product/custom/update', params);
}
