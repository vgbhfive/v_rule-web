import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export interface PeriodInfo {
  id: number;
  ruleName: string;
  ruleNo: string;
  isValid: number;
  createAt: string;
}

/**
 * 获取规则列表
 */
export async function getPeriodList(params: Recordable<any>) {
  return requestClient.post<PeriodInfo[]>('/period/list', params);
}
