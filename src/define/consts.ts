
export const tablePrefix = 'hpy';

export const caches = {
  userToken: (token: string) => `hpy_userToken:${token}`,
}


/** 支付超时时间 */
export const PAY_EXPIRE_LIMIT = 1000 * 60 * 60 * 24; // 24 hours