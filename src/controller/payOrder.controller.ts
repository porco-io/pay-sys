import { Inject, Controller, Get, Query, Post, Body, Patch, httpError, Param, Del } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { UserService } from '../service/user.service';
import { PaymentService } from '../service/payment.service';
import { CreatePayOrderDTO } from '../dto/payOrder.dto';

@Controller('/api/payOrder')
export class PayOrderController {
  @Inject()
  ctx: Context;

  @Inject()
  paymentService: PaymentService;

  // 创建支付单
  @Post('/', {
    description: '创建支付单'
  })
  async create(@Body() params: CreatePayOrderDTO) {
    const { orderSn } = params;
  }

 
  
}
