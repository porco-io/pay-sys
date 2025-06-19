import { getSchema, Rule, RuleType } from "@midwayjs/validate";
import { orderSnRule, paymentCodeRule } from "./base";
import { ApiProperty } from "@midwayjs/swagger";
import { PaymentType } from "../define/enums";

export class WxPayParamsDTO {
  @Rule(RuleType.string().max(50))
  @ApiProperty({ description: '用户openId，小程序和jsapi支付需要，用户的openId在每一个app中都不一样', example: 'oKuyD64Jz7mpuocREnh78ei64r74' })
  openId?: string;

  @Rule(RuleType.string().max(50))
  @ApiProperty({ description: 'appId', example: 's3w341dfgewrwe12' })
  appId?: string;

  @Rule(RuleType.string().equal(...Object.values(PaymentType)).required())
  @ApiProperty({ description: '支付形式', example: 'u4dUATGG' })
  payType: PaymentType;
}

export class AliPayPayParamsDTO {
  // @Rule(RuleType.string().max(50).required())
  // openId2: string;
}
/**  创建支付单DTO */
export class CreatePayOrderDTO {
  @Rule(paymentCodeRule)
  @ApiProperty({ description: '支付代码(应用只绑定一种支付方式时可以不传)', example: 'u4dUATGG' })
  paymentCode?: string;

  @Rule(RuleType.string().max(10))
  @ApiProperty({ description: '支付标题, 一般是订单的业务名称, 比如：充值', example: '充值' })
  title?: string;

  /** 支付参数，比如微信支付 需要用户的openId */
  @Rule(RuleType.alternatives([getSchema(WxPayParamsDTO)]).required())
  payParams: WxPayParamsDTO | AliPayPayParamsDTO;
}

/** 微信支付回调参数 */
export class WxPayCallbackDTO {
  @Rule(RuleType.string().allow(''))
  id: string;
  @Rule(RuleType.string().allow(''))
  create_time: string;
  @Rule(RuleType.string().allow(''))
  resource_type: string;
  @Rule(RuleType.string().allow(''))
  event_type: string;
  @Rule(RuleType.string().allow(''))
  summary: string;
  @Rule(RuleType.object())
  resource: {
    original_type: string;
    algorithm: string;
    ciphertext: string;
    associated_data: string;
    nonce: string
  }
}