import { Rule, RuleType } from "@midwayjs/validate";
import { PaginationDTO } from "./base";
import { ApiProperty } from "@midwayjs/swagger";


/**  创建appDTO */
export class CreateApplicationDTO {
  @Rule(RuleType.string().min(2).max(15).required())
  @ApiProperty({ description: '应用名称', example: 'Hipo社区' })
  name: string;
}

/**  更新appDTO */
export class UpdateApplicationDTO {
  @Rule(RuleType.string().min(2).max(15))
  @ApiProperty({ description: '应用名称', example: 'Hipo社区' })
  name?: string;
}

/**  查询app列表DTO */
export class QueryAppPageListDTO extends PaginationDTO {
  @Rule(RuleType.string().allow('').max(30))
  @ApiProperty({ description: '应用名称', example: 'Hipo社区' })
  name?: string;
}


/**  设置app支付方式DTO */
export class SetAppPaymentsDTO {
  @Rule(RuleType.array().items(RuleType.string().required()).required())
  @ApiProperty({ description: '支付代码数组' })
  paymentCodes: string[];
}