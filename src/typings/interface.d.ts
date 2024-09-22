
declare module IStruct {
  /** data from cvs file */
  type CvsData = {
    columns: string[],
    rows: string[][]
  }

  type UserCache = {
    id: number,
    username: string,
    isAdmin: boolean,
    jti?: string,
  }

  // 定义泛型接口PageList，表示一个包含列表分页信息的数据结构
  type PageList<T> = {
    /** 当前页码 */
    page: number,
    /** 每页数量 */
    size: number,
    /** 总页数 */
    total: number,
    /** 数据总量 */
    count: number
    /** 数据列表 */
    list: T[],
  }
}

type HttpResp<T> = {
  data: T,
  success: boolean,
  message: string,
  code: string,
}

declare module IParams {
  type UpdateUserProfileParams = {
    nickname: string,
    baseLocation: string,
    birth: string,
    mkRoleIds: number[],
    gender: import("src/define/consts").UserGender
  }
}