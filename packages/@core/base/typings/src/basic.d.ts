interface BasicOption {
  label: string;
  value: string;
}

type SelectOption = BasicOption;

type TabOption = BasicOption;

interface BasicUserInfo {
  /**
   * 用户email
   */
  email: string;
  /**
   * ID
   */
  id: number;
  /**
   * 用户昵称
   */
  mobile: string;
  /**
   * 用户名
   */
  name: string;
}

type ClassType = Array<object | string> | object | string;

export type { BasicOption, BasicUserInfo, ClassType, SelectOption, TabOption };
