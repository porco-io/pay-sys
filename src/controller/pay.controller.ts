import { Inject, Controller, Get, Query, Post, Body, Patch, httpError, Param, Del } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { UserService } from '../service/user.service';
import { PaymentService } from '../service/payment.service';
import { WxPayCallbackDTO } from '../dto/payOrder.dto';
import { PayService } from '../service/pay.service';
import { MidwayLogger } from '@midwayjs/logger';
import PayState from '../define/enums';

@Controller('/api/pay')
export class PayController {
  @Inject()
  ctx: Context;

  @Inject()
  logger: MidwayLogger


  @Inject()
  payService: PayService;

  // 获取支付参数
  @Get('/:paySn/payParams', {
    description: '获取支付参数',
  })
  async getPayParams(@Param('paySn') paySn: string) {
    const payOrder = await this.payService.findByPaySn(paySn);
    if (!payOrder) {
      throw new httpError.BadRequestError('支付单不存在');
    }
    /// 如果不是正在支付的支付单，则抛错
    const stateErrMsg = payOrder.matchState(PayState.paying);
    if (stateErrMsg) {
      throw new httpError.ConflictError(stateErrMsg);
    }
    const payParams = await this.payService.getPayParams(payOrder);
    return payParams;
  }

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
