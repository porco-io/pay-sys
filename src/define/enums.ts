/** jwt keyid */
export enum JwtKeyid {
  user = "hpy_user",
}

export enum UserStatus {
  // 禁用
  DISABLED = -1,
  // 正常
  NORMAL = 0,
}

export enum AuditState {
  init = "init",
  pass = "pass",
  reject = "reject",
}

export enum PaymentPlatform {
  wechat = "wechat",
  alipay = "alipay",
}

export const paymentPlatformCn = {
  [PaymentPlatform.wechat]: "微信",
  [PaymentPlatform.alipay]: "支付宝",
};

/** 订单状态 */
export enum OrderState {
  /* 已关闭 */
  close = -1,
  /* 待付款 */
  paying = 0,
  /* 待发货 */
  prepare = 1,
  /* 待收货 */
  shipping = 2,
  /* 退款/售后 */
  refund = 3,
  /* 已完成 */
  completed = 9,
}
