import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export interface RuleInfo {
  id: number;
  ruleName: string;
  ruleNo: string;
  isValid: number;
  createAt: string;
}

/**
 * 获取规则列表
 */
export async function getRuleList(params: Recordable<any>) {
  return requestClient.post<RuleInfo[]>('/rule/list', params);
}
