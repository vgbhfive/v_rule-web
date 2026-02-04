import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export interface DeployInfo {
  id: number;
  lineNo: string;
  name: string;
  no: string;
  type: string;
  field: string;
}

export interface DeployDoneInfo {
  id: number;
  lineNo: string;
  deployType: string;
  name: string;
  no: string;
  statusCode: number;
  field: string;
  deployDesc: string;
  createAt: string;
}

export interface DeployParams {
  lineNo?: string;
  deployType: string;
  sceneNo: string;
}

export interface DeployDiffInfo {
  deployStatus: number;
  scene: diffDetail[];
  divide: diffDetail[];
  strategy: diffDetail[];
  limit: diffDetail[];
  period: diffDetail[];
  interest: diffDetail[];
  custom: diffDetail[];
  rule: diffDetail[];
  ruleSet: diffDetail[];
  dataCategory: diffDetail[];
  dataSource: diffDetail[];
}

export interface diffDetail {
  no: string;
  name: string;
  results: {
    name: string;
    newValue: string;
    oldValue: string;
  }[];
}

/**
 * 获取可上线的场景列表
 * @param param
 * @returns
 */
export async function getDeployList(param: DeployParams) {
  return requestClient.post<{ items: DeployInfo[]; total: number }>(
    '/deploy/list',
    param,
  );
}

/**
 * 获取已上线的场景列表
 * @param param
 * @returns
 */
export async function getAlreadyDeployList(param: DeployParams) {
  return requestClient.post<{ items: DeployDoneInfo[]; total: number }>(
    '/deploy/done/list',
    param,
  );
}

/**
 * 获取查询编码下拉列表
 * @param params
 * @returns
 */
export async function getNoDropdownList(params: Recordable<any>) {
  return requestClient.post<{ key: string; value: string }[]>(
    '/deploy/dropdown/list',
    params,
  );
}

/**
 * 获取上线差异列表
 * @param params
 * @returns
 */
export async function deployDiff(params: Recordable<any>) {
  return requestClient.post<DeployDiffInfo>(
    `/deploy/diff?no=${params.no}&type=${params.type}`,
  );
}

/**
 * 上线部署
 * @param params
 * @returns
 */
export async function deployPass(params: Recordable<any>) {
  return requestClient.post<{ items: DeployDoneInfo[]; total: number }>(
    '/deploy/pass',
    params,
  );
}
