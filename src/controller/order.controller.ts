import {
  Inject,
  Controller,
  Get,
  httpError,
  Queries,
  Post,
  Patch,
  Param,
  Body,
  Logger,
  ILogger,
} from "@midwayjs/core";
import { Context } from "@midwayjs/koa";
import { LoginRequired } from "../middleware/auth.middleware";
import { CancelOrderDTO, CreateOrderDTO, QueryOrderPageListDTO } from "../dto/order.dto";
import { OrderService } from "../service/order.service";
import { CreatePayOrderDTO } from "../dto/payOrder.dto";
import {  PayService } from "../service/pay.service";
import { ApplicationService } from "../service/application.service";

@Controller("/api/order")
export class OrderController {
  @Inject()
  ctx: Context;

  @Inject()
  orderService: OrderService;

  @Inject()
  appService: ApplicationService;

  @Inject()
  payService: PayService;

  @Logger()
  logger: ILogger;

  /** 创建订单 */
  @Post("/", {
    description: "创建订单",
    middleware: [LoginRequired],
  })
  async create(@Body() params: CreateOrderDTO) {
    const order = await this.orderService.create(params);
    return order;
  }


  /** 发起订单支付 */
  @Post("/:orderSn/pay", {
    description: "发起订单支付",
    middleware: [LoginRequired],
  })
  async createPayOrder(@Param("orderSn") orderSn: string, @Body() params: CreatePayOrderDTO) {
    // 
    // const order = await this.orderService.create(params);
    this.logger.debug('params: ', params);
    // const order = await this.orderService.create(params);
    const order = await this.orderService.findBySn(orderSn);
    if (!order) {
      throw new httpError.NotFoundError("订单不存在");
    }

    const payOrder = await this.payService.findOrCreatePayOrder(order, params);
    return payOrder;
  }

  /** 获取订单详情 */
  @Get("/:orderSn", {
    description: "获取订单详情",
    middleware: [LoginRequired],
  })
  async detail(@Param("orderSn") orderSn: string) {
    const order = await this.orderService.findBySn(orderSn);
    const payment = order.paymentCode
      ? await order.$get("payment", {
          attributes: ["id", "code", "name", "icon"],
        })
      : null;
    order.setDataValue("payment", payment);
    return order;
  }

  /** 获取订单分页列表 */
  @Get("/pageList", {
    description: "获取订单分页列表",
    middleware: [LoginRequired],
  })
  async pageList(@Queries() params: QueryOrderPageListDTO) {
    const pageData = await this.orderService.pageList(params);
    return pageData;
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
  @Patch("/:orderSn/cancel", {
    description: "取消订单",
    middleware: [LoginRequired],
  })
  async cancel(@Param("orderSn") orderSn: string, @Body() params: CancelOrderDTO) {
    const order = await this.orderService.findBySn(orderSn);
    if (!order) {
      throw new httpError.NotFoundError("订单不存在");
    }
    if (params.force) {
      await this.orderService.cancelForce(order)
    } else {
      await this.orderService.cancel(order)
    }

    return true;
  }

}
