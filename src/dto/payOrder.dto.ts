import { Rule } from "@midwayjs/validate";
import { orderSnRule, payCodeRule } from "./base";
import { ApiProperty } from "@midwayjs/swagger";


/**  创建支付单DTO */
export class CreatePayOrderDTO {
  @Rule(payCodeRule)
  @ApiProperty({ description: '支付代码(应用只绑定一种支付方式时可以不传)', example: 'u4dUATGG' })
  payCode?: string;

  @Rule(payCodeRule)
  @ApiProperty({ description: '支付标题, 一般是订单的业务名称, 比如：充值', example: '充值' })
  title?: string;
}
