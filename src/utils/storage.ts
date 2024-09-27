export enum StorageKeys {
  wxAppAccessToken = 'wx_app_access_token'
}

export const storage: {
  [s in StorageKeys]?: any
} = {};

/** 添加运行时缓存 */
export const addStorage = function (key: StorageKeys, value: any, timeout?: number) {
  storage[key] = value;
  if (timeout) {
    setTimeout(() => {
      delete storage[key];
    }, timeout)
  }
}