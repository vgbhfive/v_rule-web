import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

/**
 * 更新利率产品状态
 * @param params
 * @returns
 */
export async function updateProductValid(params: Recordable<any>) {
  return requestClient.post('/product/valid', params);
}

/**
 * 获取不同的产品下拉列表
 * @param params
 * @returns
 */
export async function getProductDropdownList(params: Recordable<any>) {
  return requestClient.post<{ key: string; value: string }[]>(
    '/product/dropdown/list',
    params,
  );
}

export * from './custom';
export * from './interest';
export * from './limit';
export * from './period';
