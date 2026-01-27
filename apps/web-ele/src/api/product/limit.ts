import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export interface LimitInfo {
  id: number;
  ruleName: string;
  ruleNo: string;
  isValid: number;
  createAt: string;
}

/**
 * 获取规则列表
 */
export async function getLimitList(params: Recordable<any>) {
  return requestClient.post<LimitInfo[]>('/limit/list', params);
}
