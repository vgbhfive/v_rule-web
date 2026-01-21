import type { BasicUserInfo } from '@vben-core/typings';

/** 用户信息 */
interface UserInfo extends BasicUserInfo {
  /**
   * token
   */
  token: string;
  /**
   * 用户角色列表
   */
  roles: string[];
}

export type { UserInfo };
