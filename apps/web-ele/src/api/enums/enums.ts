import type { UserInfo } from '@vben/types';

import { requestClient } from '#/api/request';

/**
 * 获取业务线信息
 */
export async function getLineInfoApi() {
  return requestClient.get<UserInfo>('/user/info');
}
