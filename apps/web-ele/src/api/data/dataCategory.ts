import type { Recordable } from '@vben/types';

import type { Dropdown } from '../system/line';

import { requestClient } from '#/api/request';

export interface DataCategoryInfo {
  id: number;
  lineNo: string;
  dataCategoryName: string;
  dataCategoryNo: string;
  sourceFrom: string;
  sourceType: string;
  priority: number;
  categoryType: number;
  isValid: number;
  version: number;
  createAt: string;
  detailList: DataCategoryDetail[];
  detailCalcList: DataCategoryCalcDetail[];
}

export interface DataCategoryParams {
  lineNo?: string;
  dataCategoryName?: string;
  dataCategoryNo?: string;
  isValid?: number;
}

export interface DataCategoryDetail {
  dataCategoryNo?: string;
  key: string;
  valueType: string;
  value: string;
  trialValue?: string;
}

export interface DataCategoryCalcDetail {
  dataCategoryNo?: string;
  valueType: string;
  value: string;
  cond: string;
  threshold: string;
  res: string;
  priority: number;
}

/**
 * 获取数据源分类列表
 */
export async function getDataCategoryList(param: DataCategoryParams) {
  return requestClient.post('/dataCategory/list', param);
}

/**
 * 创建数据源分类
 * @param param
 * @returns
 */
export async function createDataCategory(param: Recordable<any>) {
  return requestClient.post('/dataCategory/create', param);
}

/**
 * 更新数据源分类
 * @param param
 * @returns
 */
export async function updateDataCategory(param: Recordable<any>) {
  return requestClient.post('/dataCategory/update', param);
}

/**
 * 生效/失效数据源分类
 */
export async function updateDataCategoryValid(params: Recordable<any>) {
  return requestClient.post(`/dataCategory/valid`, params);
}

/**
 * 数据源分类详情
 * @param id
 * @returns
 */
export async function getDataCategoryDetail(id: number) {
  return requestClient.post<DataCategoryInfo>(`/dataCategory/detail/${id}`);
}

/**
 * 获取数据源分类下拉列表
 * @param param
 * @returns
 */
export async function getDataCategoryDropdownList(param: Recordable<any>) {
  return requestClient.post<Dropdown[]>('/dataCategory/dropdown/list', param);
}

/**
 * 试算接口
 * @param param
 * @returns
 */
export async function dataCategoryTrial(param: Recordable<any>) {
  return requestClient.post('/dataCategory/trial', param);
}

/**
 * 获取本地表数据源分类的数据表列表
 * @param param
 * @returns
 */
export async function dataCategoryLocalTableList(param: Recordable<any>) {
  return requestClient.post<any[]>('/dataCategory/local/table/tables', param);
}

/**
 * 获取本地表数据源分类的数据表字段列表
 * @param params
 * @returns
 */
export async function dataCategoryLocalTableColumns(params: Recordable<any>) {
  return requestClient.post<any[]>('/dataCategory/local/table/columns', params);
}
