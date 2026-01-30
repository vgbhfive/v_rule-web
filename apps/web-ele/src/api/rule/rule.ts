import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export interface RuleInfo {
  id: number;
  lineNo: string;
  ruleName: string;
  ruleNo: string;
  dataSourceNo: string;
  cond: string;
  threshold: string;
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
 * 更新规则
 * @param params
 * @returns
 */
export async function updateRule(params: Recordable<any>) {
  return requestClient.post('/rule/update', params);
}

/**
 * 更新规则状态
 * @param params
 * @returns
 */
export async function updateRuleValid(params: Recordable<any>) {
  return requestClient.post('/rule/valid', params);
}

/**
 * 获取规则下拉列表
 * @param params
 * @returns
 */
export async function getRuleDropdownList(params: Recordable<any>) {
  return requestClient.post<{ key: string; value: string }[]>(
    '/rule/dropdown/list',
    params,
  );
}
