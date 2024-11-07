import { ApiProperty } from "@midwayjs/swagger";
import { Rule, RuleType } from "@midwayjs/validate";
import { amountRule, IDRule, KeyRule, PaginationDTO, stringNil } from "./base";
import { OrderProcessType, OrderState } from "../define/enums";

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

  @Rule(RuleType.string().max(15))
  @ApiProperty({ description: "业务名称" })
  bizName?: string;

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

  @ApiProperty({ description: "优惠券id" })
  @Rule(RuleType.array().items(IDRule).default(() => ([])))
  couponIds: number[];

  @ApiProperty({ description: "订单流程类型" })
  @Rule(RuleType.string().equal(OrderProcessType.auto, OrderProcessType.manual).required())
  procType: OrderProcessType;

  @ApiProperty({ description: "请求发货链接" })
  @Rule(stringNil)
  shipHookUrl?: string;
}


export class QueryOrderPageListDTO extends PaginationDTO {

  @Rule(RuleType.string().allow('').max(32))
  @ApiProperty({ description: '应用id', example: '' })
  appKey?: string;

  @Rule(RuleType.string().allow('').max(50))
  @ApiProperty({ description: '订单名称', example: '衣服' })
  orderName?: string;

  @Rule(RuleType.string().allow('').max(20))
  @ApiProperty({ description: '用户ID', example: '' })
  userId?: string;

  @Rule(RuleType.string().allow('').max(20))
  @ApiProperty({ description: '店铺名称', example: '' })
  shopName?: string;

  @Rule(RuleType.string().allow('').max(20))
  @ApiProperty({ description: '支付代码', example: '' })
  paymentCode?: string;

  @Rule(RuleType.string().allow('').equal(...Object.values(OrderState)).max(10))
  @ApiProperty({ description: '订单状态', example: '' })
  state?: OrderState;
  
  @Rule(RuleType.string().allow('').equal(...Object.values(OrderState)).max(10))
  @ApiProperty({ description: '退款状态', example: '' })
  refundState?: OrderState;

  @Rule(RuleType.string().allow('').max(50))
  @ApiProperty({ description: '业务单号', example: '' })
  bizNo?: string;

  @Rule(RuleType.string().allow('').max(50))
  @ApiProperty({ description: '商品名称', example: '' })
  goodsName?: string;

  @Rule(amountRule)
  @ApiProperty({ description: '最小金额', example: '' })
  minAmount?: number;

  @Rule(amountRule)
  @ApiProperty({ description: '最大金额', example: '' })
  maxAmount?: number;
}


export class CancelOrderDTO {
  @Rule(RuleType.bool().default(false))
  @ApiProperty({ description: '是否强制取消订单', example: 'true' })
  force?: boolean;
}