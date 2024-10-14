import { Inject, Controller, Get, Query, Post, Body, Patch, httpError, Param, Del } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { UserService } from '../service/user.service';
import { PaymentService } from '../service/payment.service';
import { WxPayCallbackDTO } from '../dto/payOrder.dto';
import { PayService } from '../service/pay.service';
import { MidwayLogger } from '@midwayjs/logger';

@Controller('/api/pay')
export class PayController {
  @Inject()
  ctx: Context;

  @Inject()
  logger: MidwayLogger

  @Inject()
  paymentService: PaymentService;
  @Inject()
  payService: PayService;

  // 微信支付回调
  @Post('/wxCallback/:paySn', {
    description: '微信支付回调(只有支付成功才有回调)',
  })
  async handleWxPayCallback(@Param('paySn') paySn: string, @Body() params: WxPayCallbackDTO) {
    this.logger.info('handleWxPayCallback - paySn: ', paySn, '\n', JSON.stringify(params));
    // 处理支付回调
    try {
      const payOrder = await this.payService.findByPaySn(paySn);
      if (!payOrder) {
        throw new httpError.BadRequestError('支付单不存在');
      }
      await this.payService.handleWxPayCallback(payOrder, params);
    } catch (err) {
      this.logger.error(err);
    }
    return true;
  }
}
