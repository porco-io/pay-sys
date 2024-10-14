import { getSchema, Rule, RuleType } from "@midwayjs/validate";
import { orderSnRule, payCodeRule } from "./base";
import { ApiProperty } from "@midwayjs/swagger";

class WxPayParamsDTO {
  @Rule(RuleType.string().max(50).required())
  openId: string;
}

class AliPayPayParamsDTO {
  // @Rule(RuleType.string().max(50).required())
  // openId2: string;
}
/**  创建支付单DTO */
export class CreatePayOrderDTO {
  @Rule(payCodeRule)
  @ApiProperty({ description: '支付代码(应用只绑定一种支付方式时可以不传)', example: 'u4dUATGG' })
  payCode?: string;

  @Rule(payCodeRule)
  @ApiProperty({ description: '支付标题, 一般是订单的业务名称, 比如：充值', example: '充值' })
  title?: string;

  /** 支付参数，比如微信支付 需要用户的openId */
  @Rule(RuleType.alternatives([getSchema(WxPayParamsDTO)]))
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