import type { UserInfo } from '@vben/types';

import { requestClient } from '#/api/request';

/**
 * 获取业务线信息
 */
export async function getLineInfoApi() {
  return requestClient.get<UserInfo>('/user/info');
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

/**
 * 获取条件类型下拉列表
 * @returns
 */
export async function getConditionTypes() {
  return requestClient.get<{ name: string; value: string }[]>(
    '/enum/conditionType',
  );
}

/**
 * 获取值类型下拉列表
 * @returns
 */
export async function getValueTypes() {
  return requestClient.get<{ name: string; type: string }[]>('/enum/valueType');
}

/**
 * 获取结果下拉列表
 * @returns
 */
export async function getResultTypes() {
  return requestClient.get<{ name: string; result: string }[]>(
    '/enum/resultType',
  );
}

/**
 * 获取规则类型下拉列表
 * @returns
 */
export async function getRuleTypes() {
  return requestClient.get<{ key: string; name: string }[]>('/enum/ruleType');
}

/**
 * 获取联合条件下拉列表
 * @returns
 */
export async function getCombineTypes() {
  return requestClient.get<{ name: string; value: string }[]>(
    '/enum/combineType',
  );
}

/**
 * 获取利率产品单位类型下拉列表
 * @returns
 */
export async function getInterestUnitTypes() {
  return requestClient.get<{ name: string; type: string }[]>(
    '/enum/interestUnitType',
  );
}

/**
 * 获取账期产品账期类型下拉列表
 * @returns
 */
export async function getPeriodTypes() {
  return requestClient.get<{ name: string; type: string }[]>(
    '/enum/periodType',
  );
}

/**
 * 获取策略集模式下拉列表
 * @returns 
 */
export async function getStrategyModelTypes() {
  return requestClient.get<{ name: string; model: string }[]>('/enum/strategyModel');
}
