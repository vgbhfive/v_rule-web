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
}

export interface DataSourceParams {
  lineNo?: string;
  dataSourceName?: string;
  dataSourceNo?: string;
  field?: string;
  dataCategoryNo?: string;
  isValid?: number;
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
 * 数据源下拉
 */
export async function getDataSourceDropdownList(params: Recordable<any>) {
  return requestClient.post<{ key: string; value: string }[]>(
    `/dataSource/dropdown/list`,
    params,
  );
}
