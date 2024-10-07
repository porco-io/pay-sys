import { ApiProperty } from "@midwayjs/swagger";
import { Rule, RuleType } from "@midwayjs/validate";
import { amountRule, IDRule, KeyRule } from "./base";

export class CreateOrderDTO {
  @ApiProperty({ description: "应用Key" })
  @Rule(KeyRule.required())
  appKey: string;

  @ApiProperty({ description: "购买用户特征ID" })
  @Rule(RuleType.string().required())
  userId: string;

  @ApiProperty({ description: "订单结算总价 单位分" })
  @Rule(amountRule.required())
  amount: number;

  @ApiProperty({ description: "订单名称" })
  @Rule(RuleType.string().required())
  orderName: string;

  @ApiProperty({ description: "商品名称" })
  @Rule(RuleType.string())
  goodsName?: string;

  @ApiProperty({ description: "备注" })
  @Rule(RuleType.string())
  note?: string;

  @ApiProperty({ description: "店铺名称" })
  @Rule(RuleType.string())
  shopName?: string;

  @ApiProperty({ description: "订单原价 单位分" })
  @Rule(amountRule.default(0))
  originalAmount: number;

  @ApiProperty({ description: "订单优惠 单位分" })
  @Rule(amountRule.default(0))
  discount: number;

  @ApiProperty({ description: "商品信息" })
  @Rule(RuleType.object().required())
  goodsInfo: Record<string, any>;

  @ApiProperty({ description: "支付方式id" })
  @Rule(IDRule.required())
  paymentId: number;

  @ApiProperty({ description: "优惠券id" })
  @Rule(RuleType.array().items(IDRule).default(() => ([])))
  couponIds: number[];
}
