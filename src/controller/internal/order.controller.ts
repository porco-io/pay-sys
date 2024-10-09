import { Inject, Controller, Get, httpError, Queries, Post, Patch, Param, Body, Del} from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { InternalRequired } from '../../middleware/auth.middleware';
import { CreateOrderDTO } from '../../dto/order.dto';

@Controller('/internal/order')
export class OrderController {
  @Inject()
  ctx: Context;

  /** 创建订单 */
  @Post('/', {
    description: '创建订单',
    middleware: [
      InternalRequired
    ]
  })
  async create(@Queries() params: CreateOrderDTO) {
    return '待开发'
  }
  // /** 更新订单部分信息 */
  // @Patch('/:orderSn', {
  //   description: '创建订单',
  //   middleware: [
  //     InternalRequired
  //   ]
  // })
  // async update(@Param('orderSn') orderSn: string, @Body() params: UpdateOrderDTO) {
  //   return '待开发'
  // }
  /** 取消订单 */
  @Patch('/:orderSn/cancel', {
    description: '创建订单',
    middleware: [
      InternalRequired
    ]
  })
  async cancel(@Param('orderSn') orderSn: string) {
    return '待开发'
  }

 
}