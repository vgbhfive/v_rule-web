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

export interface LineParams {
  lineName: string;
  lineNo: string;
  isValid: number;
}

export interface LineDropdown {
  key: string;
  value: string;
}

/**
 * 获取业务线列表
 */
export async function getLineList(params: Recordable<any>) {
  return requestClient.post<LineInfo[]>('/line/list', params);
}

/**
 * 获取业务线下拉列表
 * @returns
 */
export async function getLineDropdownList() {
  return requestClient.get<LineDropdown[]>('/line/dropdown/list');
}
