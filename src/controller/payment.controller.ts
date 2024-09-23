import { Inject, Controller, Get, Query, Post, Body, Patch, httpError, Param } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { UserService } from '../service/user.service';
import { CreatePaymentDTO, QueryPaymentPageListDTO } from '../dto/payment.dto';
import { PaymentService } from '../service/payment.service';

@Controller('/api/payment')
export class PaymentController {
  @Inject()
  ctx: Context;

  @Inject()
  paymentService: PaymentService;

  // 创建支付方式
  @Post('/', {
    description: '创建支付方式'
  })
  async create(@Body() params: CreatePaymentDTO) {
    return this.paymentService.createPayment(params);
  }

  // 创建支付方式
  @Patch('/:code', {
    description: '修改支付方式'
  })
  async patch(@Body() params: CreatePaymentDTO, @Param('code') code: string) {
    const payment = await this.paymentService.findByCode(code);
    if (!payment) {
      throw new httpError.NotFoundError('支付方式不存在');
    }
    return this.paymentService.updatePayment(payment, params);
  }

  // 获取支付方式列表
  @Get('/pageList', {
    description: '获取支付方式列表'
  })
  async pageList(@Query() query: QueryPaymentPageListDTO) {
    return this.paymentService.pageList(query);
  }


  // 获取支付方式详情
  @Get('/:code', {
    description: '获取支付方式详情'
  })
  async detail(@Param('code') code: string) {
    const payment = await this.paymentService.findByCode(code);
    if (!payment) {
      throw new httpError.NotFoundError('支付方式不存在');
    }
    return payment;
  }
}
