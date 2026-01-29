import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export interface RuleInfo {
  id: number;
  lineNo: string;
  ruleName: string;
  ruleNo: string;
  dataSourceNo: string;
  cond: string;
  threshold: number;
  thresholdType: string;
  result: string;
  version: number;
  isValid: number;
  deleteAt: string;
  createAt: string;
}

/**
 * 获取规则列表
 */
export async function getRuleList(params: Recordable<any>) {
  return requestClient.post<RuleInfo[]>('/rule/list', params);
}

/**
 * 新增规则
 * @param params
 * @returns
 */
export async function createRule(params: Recordable<any>) {
  return requestClient.post('/rule/create', params);
}

/**
 * 更新规则状态
 * @param params
 * @returns
 */
export async function updateRuleValid(params: Recordable<any>) {
  return requestClient.post('/rule/valid', params);
}
