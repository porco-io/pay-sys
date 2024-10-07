import { Rule, RuleType } from "@midwayjs/validate";
import { PaginationDTO } from "./base";
import { ApiProperty } from "@midwayjs/swagger";


export class CreateApplicationDTO {
  @Rule(RuleType.string().min(2).max(15).required())
  @ApiProperty({ description: '应用名称', example: 'Hipo社区' })
  name: string;
}

export class UpdateApplicationDTO {
  @Rule(RuleType.string().min(2).max(15))
  @ApiProperty({ description: '应用名称', example: 'Hipo社区' })
  name?: string;
}

/**  查询支付方式列表DTO */
export class QueryAppPageListDTO extends PaginationDTO {
  @Rule(RuleType.string().allow('').max(30))
  @ApiProperty({ description: '应用名称', example: 'Hipo社区' })
  name?: string;
}
