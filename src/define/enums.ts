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
  /* 初始化 */
  init = 'init',
  /* 已关闭 */
  closed = 'closed',
  /* 待付款 */
  paying = 'paying',
  /* 待发货 */
  preparing = 'preparing',
  /* 待收货 */
  shipping = 'shipping',
  /* 退款/售后 */
  refunding = 'refunding',
  /* 已完成 */
  completed = 'completed',
}

/** 售后状态 0. 无售后 1. 申请中 2. 处理中 3. 已完成 */
export enum RefundState {
  /* 无售后 */
  none = 'none',
  /* 申请中 */
  applying = 'applying',
  /* 处理中 */
  processing = 'processing',
  /* 已完成 */
  completed = 'completed',
}