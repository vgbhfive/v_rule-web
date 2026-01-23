import { baseRequestClient, requestClient } from '#/api/request';

export namespace AuthApi {
  /** 登录接口参数 */
  export interface LoginParams {
    password?: string;
    email?: string;
  }

  /** 登录接口返回值 */
  export interface LoginResult {
    email: string;
    mobile: string;
    name: string;
    token: string;
  }

  export interface RefreshTokenResult {
    token: string;
  }

  export interface ChangePasswordParams {
    email: string;
    oldPassword: string;
    newPassword: string;
    newDupPassword: string;
  }
}

/**
 * 登录
 */
export async function loginApi(data: AuthApi.LoginParams) {
  return requestClient.post<AuthApi.LoginResult>('/user/login', data);
}

/**
 * 刷新accessToken
 */
export async function refreshTokenApi() {
  return baseRequestClient.post<AuthApi.RefreshTokenResult>(
    '/user/refreshToken',
    {
      withCredentials: true,
    },
  );
}

/**
 * 获取用户权限码
 */
export async function getAccessCodesApi() {
  return requestClient.get<string[]>('/auth/codes');
}

/**
 * 修改用户密码
 * @param data
 * @returns
 */
export async function changePasswordApi(data: AuthApi.ChangePasswordParams) {
  return requestClient.post('/user/changePassword', data);
}
