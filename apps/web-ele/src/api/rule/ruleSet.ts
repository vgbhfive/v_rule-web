import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export interface RuleSetInfo {
  id: number;
  lineNo: string;
  ruleSetName: string;
  ruleSetNo: string;
  firstNo: string;
  firstType: string;
  combine: string;
  secondNo: string;
  secondType: string;
  cond: string;
  threshold: string;
  result: string;
  version: number;
  isValid: number;
  createAt: string;
}

export interface ruleSetParams {
  lineNo: string;
  ruleSetName: string;
  ruleSetNo: string;
  isValid: number;
}

/**
 * 获取规则集列表
 */
export async function getRuleSetList(params: Recordable<any>) {
  return requestClient.post<RuleSetInfo[]>('/rule_set/list', params);
}

/**
 * 新增规则集
 * @param params
 * @returns
 */
export async function createRuleSet(params: Recordable<any>) {
  return requestClient.post('/rule_set/create', params);
}

/**
 * 更新规则集
 * @param params
 * @returns
 */
export async function updateRuleSet(params: Recordable<any>) {
  return requestClient.post('/rule_set/update', params);
}

/**
 * 更新规则集状态
 * @param params
 * @returns
 */
export async function updateRuleSetValid(params: Recordable<any>) {
  return requestClient.post('/rule_set/valid', params);
}

/**
 * 获取规则集下拉列表
 * @param params
 * @returns
 */
export async function getRuleSetDropdownList(params: Recordable<any>) {
  return requestClient.post<{ key: string; value: string }[]>(
    '/rule_set/dropdown/list',
    params,
  );
}
