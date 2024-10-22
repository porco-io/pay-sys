import { Inject, Controller, Get, Queries, Param, httpError } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { MidwayLogger } from '@midwayjs/logger';
import { PayOrderService } from '../service/payOrder.service';
import { QueryPayOrderPageListDTO } from '../dto/payOrder.dto';

@Controller('/api/payOrder')
export class PayOrderController {
  @Inject()
  ctx: Context;

  @Inject()
  logger: MidwayLogger


  @Inject()
  payOrderService: PayOrderService;

  
  @Get('/pageList', {
    description: '获取支付单列表'
  })
  async pageList(@Queries() queries: QueryPayOrderPageListDTO) {
    return await this.payOrderService.findPageList(queries);
  }


  @Get('/:paySn', {
    description: '获取支付单详情'
  })
  async detail(@Param('paySn') paySn: string) {
    const payOrder = await this.payOrderService.findBySn(paySn);
    if (!payOrder) {
      throw new httpError.NotFoundError('支付单不存在');
    } 
    return payOrder;
  }

  
}
