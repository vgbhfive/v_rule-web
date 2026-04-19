import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export interface RuleTreeDetailNode {
  index: number;
  preIndex: number;
  nodeType: number;
  combine?: string;
  ruleType?: string;
  ruleNo?: string;
}

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
  deployAt?: string;
  detailEntityList?: RuleTreeDetailNode[];
}

export interface RuleTreeParams {
  lineNo: string;
  ruleTreeName: string;
  ruleTreeNo: string;
  isValid: number;
}

/**
 * 获取规则树列表
 */
export async function getRuleTreeList(params: Recordable<any>) {
  return requestClient.post<RuleTreeInfo[]>('/rule_tree/list', params);
}

/**
 * 新增规则树
 * @param params
 * @returns
 */
export async function createRuleTree(params: Recordable<any>) {
  return requestClient.post('/rule_tree/create', params);
}

/**
 * 更新规则树
 * @param params
 * @returns
 */
export async function updateRuleTree(params: Recordable<any>) {
  return requestClient.post('/rule_tree/update', params);
}

/**
 * 更新规则树状态
 * @param params
 * @returns
 */
export async function updateRuleTreeValid(params: Recordable<any>) {
  return requestClient.post('/rule_tree/valid', params);
}

/**
 * 获取规则树详情
 * @param id
 * @returns
 */
export async function getRuleTreeDetail(id: number) {
  return requestClient.post<RuleTreeInfo>(`/rule_tree/detail/${id}`);
}

/**
 * 获取规则树下拉列表
 * @param params
 * @returns
 */
export async function getRuleTreeDropdownList(params: Recordable<any>) {
  return requestClient.post<{ key: string; value: string }[]>(
    '/rule_tree/dropdown/list',
    params,
  );
}
