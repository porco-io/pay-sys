import { Inject, Controller, Get, Query, Post, Body, Patch, httpError, Param, Del } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { UserService } from '../service/user.service';
import { PaymentService } from '../service/payment.service';
import { WxPayCallbackDTO } from '../dto/payOrder.dto';

@Controller('/api/payOrder')
export class PayOrderController {
  @Inject()
  ctx: Context;

  @Inject()
  paymentService: PaymentService;

  // 创建支付单
  @Post('/callback', {
    description: '微信支付回调',
  })
  async handleWxPayCallback(@Body() params: WxPayCallbackDTO) {
    // TODO: 处理支付回调
    return true;
  }
}
