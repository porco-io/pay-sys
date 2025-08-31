import { Inject, Controller, Get, httpError, Queries, Post, Patch, Param, Body, Logger, ILogger, } from "@midwayjs/core";
import { Context } from "@midwayjs/koa";

import { LoginRequired } from "../middleware/auth.middleware";
import { CancelOrderDTO, CreateOrderDTO, QueryOrderPageListDTO, } from "../dto/order.dto";
import { OrderService } from "../service/order.service";
import { CreatePayOrderDTO } from "../dto/pay.dto";
import { PayService } from "../service/pay.service";
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
    if (!params.appKey) {
      throw new httpError.BadRequestError('应用Key不能为空');
    }
    const order = await this.orderService.create(params);
    return order;
  }

  /** 发起订单支付 */
  @Post("/:orderSn/pay", {
    description: "发起订单支付",
    middleware: [LoginRequired],
  })
  async createPayOrder(@Param("orderSn") orderSn: string, @Body() params: CreatePayOrderDTO ) {
    // const order = await this.orderService.create(params);
    this.logger.debug("params: ", params);
    // const order = await this.orderService.create(params);
    const order = await this.orderService.findBySn(orderSn);
    if (!order) {
      throw new httpError.NotFoundError("订单不存在");
    }

    const payOrder = await this.payService.findOrCreatePayOrder(
      order,
      params
    );
    if (payOrder.payment) {
      payOrder.payment.secured();
    }
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
  @Post("/:orderSn/cancel", {
    description: "取消订单",
    middleware: [LoginRequired],
  })
  async cancel(
    @Param("orderSn") orderSn: string,
    @Body() params: CancelOrderDTO
  ) {
    const order = await this.orderService.findBySn(orderSn);
    if (!order) {
      throw new httpError.NotFoundError("订单不存在");
    }
    if (params.force) {
      await this.orderService.cancelForce(order);
    } else {
      await this.orderService.cancel(order);
    }

    return true;
  }

  /** 完成订单 */
  @Post("/:orderSn/complete", {
    description: "完成订单",
    middleware: [LoginRequired],
  })
  async complete(
    @Param("orderSn") orderSn: string,
    // @Body() params: CancelOrderDTO
  ) {
    const order = await this.orderService.findBySn(orderSn);
    if (!order) {
      throw new httpError.NotFoundError("订单不存在");
    }
    await this.orderService.complete(order);
    return true;
  }

  /** 发货 */
  @Post("/:orderSn/ship", {
    description: "发货订单",
    middleware: [LoginRequired],
  })
  async ship(
    @Param("orderSn") orderSn: string,
    // @Body() params: CancelOrderDTO
  ) {
    const order = await this.orderService.findBySn(orderSn);
    if (!order) {
      throw new httpError.NotFoundError("订单不存在");
    }
    await this.orderService.ship(order);
    return true;
  }
}
