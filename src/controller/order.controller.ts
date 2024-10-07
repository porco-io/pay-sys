import { Inject, Controller, Get, httpError, Queries, Post, Patch, Param, Body, Del} from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { LoginRequired } from '../middleware/auth.middleware';
import { UploadDTO } from '../dto/tool.dto';
import { UPLOAD_TYPE, UploadOssHelper, UploadParams } from '../utils/alicloud';
import { CreateOrderDTO } from '../dto/order.dto';

@Controller('/api/order')
export class OrderController {
  @Inject()
  ctx: Context;

  /** 创建订单 */
  @Post('/', {
    description: '创建订单',
    middleware: [
      LoginRequired
    ]
  })
  async create(@Body() params: CreateOrderDTO) {
    return '待开发'
  }

  // /** 更新订单部分信息 */
  // @Patch('/:orderSn', {
  //   description: '创建订单',
  //   middleware: [
  //     LoginRequired
  //   ]
  // })
  // async update(@Param('orderSn') orderSn: string, @Body() params: UpdateOrderDTO) {
  //   return '待开发'
  // }


  /** 取消订单 */
  @Patch('/:orderSn/cancel', {
    description: '更新订单',
    middleware: [
      LoginRequired
    ]
  })
  async cancel(@Param('orderSn') orderSn: string) {
    return '待开发'
  }

  /** 删除订单 */
  @Del('/:orderSn', {
    description: '删除订单',
    middleware: [
      LoginRequired
    ]
  })
  async remove(@Param('orderSn') orderSn: string) {
    return '待开发'
  }




}
