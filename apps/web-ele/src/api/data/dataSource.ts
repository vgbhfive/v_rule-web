import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export interface DataSourceInfo {
  id: number;
  lineNo: string;
  dataSourceName: string;
  dataSourceNo: string;
  sourceFrom: string;
  sourceType: string;
  dataCategoryNo: string;
  type: string;
  version?: number;
  isValid: number;
  createAt: string;
  function: number;
  dataSourceFunction: DataSourceFunction;
}

export interface DataSourceParams {
  lineNo?: string;
  dataSourceName?: string;
  dataSourceNo?: string;
  field?: string;
  dataCategoryNo?: string;
  isValid?: number;
}

export interface DataSourceFunction {
  type: string;
  func: string;
  params: string;
  trial: string;
}

/**
 * 获取数据源列表
 */
export async function getDataSourceList(param: DataSourceParams) {
  return requestClient.post('/dataSource/list', param);
}

/**
 * 创建数据源
 * @param param
 * @returns
 */
export async function createDataSource(param: Recordable<any>) {
  return requestClient.post('/dataSource/create', param);
}

/**
 * 更新数据源
 * @param param 更新数据源参数
 * @returns
 */
export async function updateDataSource(param: Recordable<any>) {
  return requestClient.post('/dataSource/update', param);
}

/**
 * 生效/失效数据源
 */
export async function updateDataSourceValid(params: Recordable<any>) {
  return requestClient.post(`/dataSource/valid`, params);
}

/**
 * 获取数据源详情
 * @param id 
 * @returns 
 */
export async function getDataSouceDetail(id: number) {
  return requestClient.post<DataSourceInfo>(`/dataSource/detail/${id}`);
} 

/**
 * 数据源函数试算
 * @returns 
 */
export async function dataSourceTrial(params: Recordable<any>) {
  return requestClient.post<any>(`dataSource/trial`, params);
}

/**
/**
 * 数据源下拉
 */
export async function getDataSourceDropdownList(params: Recordable<any>) {
  return requestClient.post<{ key: string; value: string }[]>(
    `/dataSource/dropdown/list`,
    params,
  );
}
