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

export * from './custom';
export * from './interest';
export * from './limit';
export * from './period';
