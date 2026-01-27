import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export interface CustomInfo {
  id: number;
  ruleName: string;
  ruleNo: string;
  isValid: number;
  createAt: string;
}

/**
 * 获取规则列表
 */
export async function getCustomList(params: Recordable<any>) {
  return requestClient.post<CustomInfo[]>('/custom/list', params);
}
