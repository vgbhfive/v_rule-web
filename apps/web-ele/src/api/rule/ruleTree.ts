import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export interface RuleTreeInfo {
  id: number;
  lineNo: string;
  ruleTreeName: string;
  ruleTreeNo: string;
  cond: string;
  threshold: string;
  result: string;
  version: number;
  isValid: number;
  createAt: string;
}

/**
 * 获取规则树列表
 */
export async function getRuleTreeList(params: Recordable<any>) {
  return requestClient.post<RuleTreeInfo[]>('/rule_tree/list', params);
}
