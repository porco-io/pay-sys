import { Rule, RuleType } from "@midwayjs/validate";
import { PaginationDTO } from "./base";
import { ApiProperty } from "@midwayjs/swagger";
import { PaymentPlatform } from "../define/enums";


/**  创建支付方式DTO */
export class CreatePaymentDTO {
  @Rule(RuleType.string().max(15).min(1).trim().required())
  @ApiProperty({ description: '支付名称', example: '微信支付' })
  name: string

  @Rule(RuleType.string().trim().equal(...Object.values(PaymentPlatform)).required())
  @ApiProperty({ description: '支付平台', example: PaymentPlatform.wechat })
  platform: PaymentPlatform

  @Rule(RuleType.string().trim().allow(''))
  @ApiProperty({ description: '账号', example: 'abc' })
  account?: string

  @Rule(RuleType.string().trim())
  @ApiProperty({ description: 'icon' })
  icon?: string

  @Rule(RuleType.string().trim().allow(''))
  @ApiProperty({ description: '描述', example: '应用支付' })
  desc?: string

  @Rule(RuleType.object().default(() => ({})))
  @ApiProperty({ description: '详情' })
  details: Record<string, any>;

  @Rule(RuleType.array().items(RuleType.string()).default(() => ([])))
  @ApiProperty({ description: '允许使用该支付的appId列表' })
  appIds: string[]
}

/**  创建支付方式DTO */
export class UpdatePaymentDTO {
  @Rule(RuleType.string().max(15).trim().min(1))
  @ApiProperty({ description: '支付名称', example: '微信支付' })
  name?: string

  @Rule(RuleType.string().trim().allow(''))
  @ApiProperty({ description: '账号', example: 'abc' })
  account?: string

  @Rule(RuleType.string().trim())
  @ApiProperty({ description: 'icon' })
  icon?: string

  @Rule(RuleType.string().trim().allow(''))
  @ApiProperty({ description: '描述', example: '应用支付' })
  desc?: string

  @Rule(RuleType.object().default(() => ({})))
  @ApiProperty({ description: '详情' })
  details?: Record<string, any>;

  @Rule(RuleType.array().items(RuleType.string()))
  @ApiProperty({ description: '允许使用该支付的appId列表' })
  appIds?: string[]
}



/**  查询支付方式列表DTO */
export class QueryPaymentPageListDTO extends PaginationDTO {
  @Rule(RuleType.string().allow('').max(30))
  @ApiProperty({ description: '支付名称', example: '微信支付' })
  name?: string;

  @Rule(RuleType.string().allow('').max(30))
  platform?: string;

  @Rule(RuleType.string().allow(''))
  @ApiProperty({ description: 'appKey' })
  appKey?: string

  @Rule(RuleType.bool().default(false))
  @ApiProperty({ description: '包含失效的' })
  withDisabled?: boolean
}
