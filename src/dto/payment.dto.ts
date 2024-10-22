import { Rule, RuleType } from "@midwayjs/validate";
import { PaginationDTO, stringNil } from "./base";
import { ApiProperty } from "@midwayjs/swagger";
import { PaymentPlatform } from "../define/enums";


/**  创建支付方式DTO */
export class CreatePaymentDTO {
  @Rule(RuleType.string().trim().max(15).required())
  @ApiProperty({ description: '支付名称', example: '微信支付' })
  name: string

  @Rule(RuleType.string().trim().equal(...Object.values(PaymentPlatform)).required())
  @ApiProperty({ description: '支付平台', example: PaymentPlatform.wechat })
  platform: PaymentPlatform

  @Rule(stringNil.trim())
  @ApiProperty({ description: '账号', example: 'abc' })
  account?: string

  @Rule(stringNil.trim())
  @ApiProperty({ description: 'icon' })
  icon?: string

  @Rule(stringNil.trim())
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
  @Rule(stringNil.trim().min(1))
  @ApiProperty({ description: '支付名称', example: '微信支付' })
  name?: string

  @Rule(stringNil.trim().allow(''))
  @ApiProperty({ description: '账号', example: 'abc' })
  account?: string

  @Rule(stringNil.trim())
  @ApiProperty({ description: 'icon' })
  icon?: string

  @Rule(stringNil.trim().allow(''))
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
  @Rule(stringNil.max(30))
  @ApiProperty({ description: '支付名称', example: '微信支付' })
  name?: string;

  @Rule(stringNil.max(30))
  platform?: string;

  @Rule(stringNil.trim())
  @ApiProperty({ description: 'appKey' })
  appKey?: string

  @Rule(RuleType.bool().default(false))
  @ApiProperty({ description: '包含失效的' })
  withDisabled?: boolean
}

export class GetAppPeymentsDTO {
  @Rule(RuleType.bool().default(false))
  @ApiProperty({ description: '是否包含失效的', example: 'true' })
  includeDisabled: boolean;
}