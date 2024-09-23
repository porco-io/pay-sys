/** jwt keyid */
export enum JwtKeyid {
  user = 'hpy_user',
}

export enum UserStatus {
  // 禁用
  DISABLED = -1,
  // 正常
  NORMAL = 0,
}

export enum AuditState {
  init = 'init',
  pass = 'pass',
  reject = 'reject',
}

export enum PaymentPlatform {
  wechat = 'wechat',
  alipay = 'alipay',
}

export const paymentPlatformCn = {
  [PaymentPlatform.wechat]: '微信',
  [PaymentPlatform.alipay]: '支付宝',
}