import { Rule, RuleType } from "@midwayjs/validate";
import { orderSnRule, PaginationDTO, paymentCodeRule, paySnRule, stringNil } from "./base";
import { ApiProperty } from "@midwayjs/swagger";
import PayState from "../define/enums";

export class QueryPayOrderPageListDTO extends PaginationDTO {
  @Rule(stringNil.max(30))
  @ApiProperty({ description: '支付名称', example: '微信支付' })
  name?: string;

  @Rule(stringNil.max(30))
  platform?: string;

  @Rule(stringNil.trim())
  @ApiProperty({ description: 'appKey' })
  appKey?: string

  @Rule(paymentCodeRule)
  @ApiProperty({ description: '支付方式' })
  paymentCode?: string;

  @Rule(orderSnRule)
  @ApiProperty({ description: '订单号' })
  orderSn?: string;

  @Rule(paySnRule)
  @ApiProperty({ description: '支付单号' })
  paySn?: string;

  @Rule(RuleType.string().equal(...Object.values(PayState)))
  @ApiProperty({ description: '支付状态', enum: PayState })
  state?: PayState;

  @Rule(RuleType.string().max(50))
  @ApiProperty({ description: '支付单名称' })
  title?: string;

  @Rule(RuleType.number().min(0).max(100000000))
  @ApiProperty({ description: '最小金额' })
  minAmount?: number;

  @Rule(RuleType.number().min(0).max(100000000))
  @ApiProperty({ description: '最大金额' })
  maxAmount?: number;

  @Rule(RuleType.string().isoDate())
  @ApiProperty({ description: '最小支付时间' })
  minPayTime?: string;

  @Rule(RuleType.string().isoDate())
  @ApiProperty({ description: '最大支付时间' })
  maxPayTime?: string;

  @Rule(RuleType.boolean().allow(''))
  @ApiProperty({ description: '是否过期' })
  isExpired?: boolean;


  @Rule(RuleType.string().equal('id', '-id', 'amount', '-amount', 'payTime', '-payTime'))
  @ApiProperty({ description: '是否成功' })
  sortBy?: string;
}
