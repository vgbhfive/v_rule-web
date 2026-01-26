import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export interface LineInfo {
  id: number;
  lineName: string;
  lineNo: string;
  url: string;
  isValid: number;
  createAt: string;
}

/**
 * 获取业务线列表
 */
export async function getLineList(params: Recordable<any>) {
  return requestClient.get<LineInfo[]>('/line/list', { params });
}
