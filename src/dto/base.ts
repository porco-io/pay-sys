import { ApiProperty } from "@midwayjs/swagger"
import { Rule, RuleType } from "@midwayjs/validate"

export class PaginationDTO {
  @Rule(RuleType.number().integer().min(1).default(1))
  @ApiProperty({ description: '分页页码', example: 1, default: 1 })
  page: number;

  @Rule(RuleType.number().integer().min(1).default(15))
  @ApiProperty({ description: '分页大小', example: 15, default: 15 })
  size: number;
}

/** id验证规则 */
export const IDRule = RuleType.number().integer().min(1);

/** 文件夹路径验证规则 */
export const fileKeyRule = RuleType.string().max(250).allow('');

/** 手机号验证规则 */
export const phoneNumberRule = RuleType.string().pattern(/^1[3-9]\d{9}$/);