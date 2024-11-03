import { Inject, Controller, Get, Query, Post, Body, Patch, httpError, Param, Del } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { PayService } from '../service/pay.service';
import { MidwayLogger } from '@midwayjs/logger';
import { TemporalService } from '../service/temporal.service';

@Controller('/api/test')
export class PayController {
  @Inject()
  ctx: Context;

  @Inject()
  logger: MidwayLogger

  @Inject()
  payService: PayService;

  @Inject()
  temporalService: TemporalService;

  // 测试接口
  @Get('/', {
    description: '测试接口',
  })
  async test() {
    return 'test';
  }

  // 测试接口
  @Get('/order-workflow/:orderSn', {
    description: '测试接口',
  })
  async testOrderWorkflow(@Param('orderSn') orderSn: string) {
    await this.temporalService.startOrderWorkflow(orderSn);
    return true;
  }

  


}
