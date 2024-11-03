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

/** 支付形态 */
export enum PaymentType {
  h5 = "h5",
  app = "app",
  mini = "mini",
  native = "native",
  jsapi = "jsapi",
}

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
  /* 待确认收货 */
  receiving ='receiving',
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

/** 支付状态 */
export enum PayState {
  /* 已关闭 */
  closed = 'closed',
  /** 待支付 */
  paying = 'paying',
  /** 支付成功 */
  success ='success',
  /** 支付失败 */
  fail = 'fail',
}


export enum OrderProccessType {
  /** 即时服务订单 */
  serviceInstant = "serviceInstant",
  /** 延时服务订单 */
  serviceDelay = "serviceDelay",
  /** 商品物流订单 */
  goodsLogistics = "goodsLogistics",
  /** 商品即时发货订单 */
  goodsInstant = "goodsInstant",
}