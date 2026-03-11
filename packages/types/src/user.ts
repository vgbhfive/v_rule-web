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
  /**
   * 按钮权限
   */
  buttonPermission: string[];
  /**
   * 页面权限
   */
  pagePermission: string[];
}

export type { UserInfo };
