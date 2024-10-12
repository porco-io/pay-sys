import { Rule, RuleType } from "@midwayjs/validate";
import { orderSnRule, PaginationDTO } from "./base";
import { ApiProperty } from "@midwayjs/swagger";
import { PaymentPlatform } from "../define/enums";


/**  创建支付单DTO */
export class CreatePayOrderDTO {
  @Rule(orderSnRule.required())
  @ApiProperty({ description: '订单号', example: '1N00M24ZSEJE7683RQHEEC2PU' })
  orderSn: string;
}
