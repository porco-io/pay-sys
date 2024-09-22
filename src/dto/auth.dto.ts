import { ApiProperty } from "@midwayjs/swagger"
import { Rule, RuleType } from "@midwayjs/validate"
/**  注册参数 */
export class SignupDTO {
  @Rule(RuleType.string().max(15).min(4).required())
  @ApiProperty({ description: '用户名', example: 'zack' })
  username: string
  @Rule(RuleType.string().max(16).min(6).required())
  @ApiProperty({ description: '密码', example: '123456' })
  password: string
}

/**  登录参数 */
export class SigninDTO {
  @Rule(RuleType.string().max(15).min(4).required())
  @ApiProperty({ description: '用户名', example: 'zack' })
  username: string
  @Rule(RuleType.string().max(16).min(1).required())
  @ApiProperty({ description: '密码', example: '123456' })
  password: string;
}
