import { Inject, Controller, Queries, Post, Patch, Param, Body} from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { LoginRequired } from '../middleware/auth.middleware';
import { CreateOrderDTO, UpdateOrderDTO } from '../dto/order.dto';

// TODO: 待开发
@Controller('/api/application')
export class PaymentController {
  @Inject()
  ctx: Context;

  /** 创建应用 */
  @Post('/', {
    description: '创建应用',
    middleware: [
      LoginRequired
    ]
  })
  async create(@Queries() params: CreateOrderDTO) {
    return '待开发'
  }

  /** 更新应用部分信息 */
  @Patch('/:orderSn', {
    description: '创建应用',
    middleware: [
      LoginRequired
    ]
  })
  async updateOrder(@Param('orderSn') orderSn: string, @Body() params: UpdateOrderDTO) {
    return '待开发'
  }


  /** 取消应用 */
  @Patch('/:orderSn/cancel', {
    description: '创建应用',
    middleware: [
      LoginRequired
    ]
  })
  async cancelOrder(@Param('orderSn') orderSn: string) {
    return '待开发'
  }

  /** 删除应用 */
  @Patch('/:orderSn/delete', {
    description: '创建应用',
    middleware: [
      LoginRequired
    ]
  })
  async deleteOrder(@Param('orderSn') orderSn: string) {
    return '待开发'
  }


  

}
