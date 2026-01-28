import type { RouteRecordStringComponent } from '@vben/types';

import { requestClient } from '#/api/request';

/**
 * 获取用户所有菜单
 */
export async function getAllMenusApi() {
  return requestClient.get<RouteRecordStringComponent[]>('/menu/all');
}

/**
 * 获取数据源类型下拉列表
 * @returns
 */
export async function getFieldTypes() {
  return requestClient.get<{ name: string; type: string }[]>('/enum/fieldType');
}

/**
 * 获取数据源分类类型
 * @returns
 */
export async function getCategoryTypes() {
  return requestClient.get<{ name: string; type: string }[]>(
    '/enum/categoryType',
  );
}
