import { Inject, Controller, Get, Query, Post, Body, Patch, httpError, Param, Del } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { PayService } from '../service/pay.service';
import { MidwayLogger } from '@midwayjs/logger';

@Controller('/api/test')
export class PayController {
  @Inject()
  ctx: Context;

  @Inject()
  logger: MidwayLogger

  @Inject()
  payService: PayService;

  // 测试接口
  @Get('/', {
    description: '测试接口',
  })
  async test() {
    return 'test';
  }


}
