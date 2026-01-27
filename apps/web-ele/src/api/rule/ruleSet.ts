import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export interface RuleSetInfo {
  id: number;
  ruleName: string;
  ruleNo: string;
  isValid: number;
  createAt: string;
}

/**
 * 获取规则集列表
 */
export async function getRuleSetList(params: Recordable<any>) {
  return requestClient.post<RuleSetInfo[]>('/ruleSet/list', params);
}
