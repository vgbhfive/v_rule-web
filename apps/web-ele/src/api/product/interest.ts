import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export interface InterestInfo {
  id: number;
  ruleName: string;
  ruleNo: string;
  isValid: number;
  createAt: string;
}

/**
 * 获取规则列表
 */
export async function getInterestList(params: Recordable<any>) {
  return requestClient.post<InterestInfo[]>('/interest/list', params);
}
