import { httpError, ILogger, Inject, Logger, Provide } from '@midwayjs/core';
import { isNil, omitBy, uniq } from 'lodash';
import { CreateApplicationDTO, QueryAppPageListDTO, UpdateApplicationDTO } from '../dto/application.dto';
import Application, { applicationScope } from '../models/models/Application.model';
import { PaymentService } from './payment.service';
import Order, { orderScope } from '../models/models/Order.model';
import { CreateOrderDTO, QueryOrderPageListDTO } from '../dto/order.dto';
import luid from 'luid'
import { OrderProcessType, OrderState } from '../define/enums';
import { genSnowflakeId } from '../utils/cipher';
import { PayService } from './pay.service';
import { apis } from '../api/apis';
import { AxiosResponse } from 'axios';
import { TemporalService } from './temporal.service';

@Provide()
export class OrderService {
  
  @Inject()
  paymentService: PaymentService;
  @Inject()
  payServer: PayService;
  @Logger()
  logger: ILogger;

  // @Inject()
  // temporalService: TemporalService;

  genOrderSn(appId: number) {
    const orderSn = `${appId.toString().padStart(2, 'A')}${genSnowflakeId()}`
    return orderSn;
  }

  /** 获取订单 */
  async findById(id: number) {
    const order = await Order.findByPk(id);
    return order;
  }

  /** 获取订单 */
  async findBySn(orderSn: string) {
    const order = await Order.findOne({
      where: {
        orderSn: orderSn,
      },
    });
    return order;
  }

  /** 创建订单 */
  async create(params: CreateOrderDTO) {
    const app = await Application.findByKey(params.appKey);
    if (!app) {
      throw new httpError.NotFoundError('创建订单失败，应用不存在');
    }
    if (params.originalAmount !== (params.amount + params.discount)) {
      params.originalAmount = (params.amount + params.discount);
    }
    const orderSn = this.genOrderSn(app.id);
    const order = await Order.create({
      ...params,
      bizName: params.bizName || app.name,
      orderSn,
    });
    // 启动订单流程
    // this.temporalService.startOrderWorkflow(order.orderSn);
    return order;
  }

  /** 更新订单 */
  async update(order: Order, params: UpdateApplicationDTO) {
    if (Object.keys(params).length) {
      await order.update(omitBy(params, isNil));
    }
    return order;
  }

  /** 查询分页列表 */
  async pageList(params: QueryOrderPageListDTO): Promise<IStruct.PageList<Order>> {
    const { page, size } = params;

    const { rows, count } = await Order.scope([
      orderScope.method('eq_appKey', params.appKey),
      orderScope.method('eq_state', params.state),
      orderScope.method('eq_refundState', params.refundState),
      orderScope.method('eq_bizNo', params.bizNo),
      orderScope.method('eq_paymentCode', params.paymentCode),
      orderScope.method('eq_shopName', params.shopName),
      orderScope.method('between_amount', [params.minAmount, params.maxAmount]),
      orderScope.method('eq_userId', params.userId),
      orderScope.method('contain_orderName', params.orderName),
      orderScope.method('contain_goodsName', params.goodsName),
      orderScope.method('include_payment'),
    ]).findAndCountAll({
      offset: (page - 1) * size,
      limit: size,
    });

    return {
      count,
      page,
      size,
      total: Math.ceil(count / size) || 1,
      list: rows,
    }
  }

  async setAppPayments(app: Application, paymentCodes: string[]) {
    if (!paymentCodes.length) {
      await app.update({ paymentCodes: [] })
      return app;
    }
    const uniqCodes = uniq(paymentCodes);
    const payments = await this.paymentService.findByCodes(uniqCodes);
    if (uniqCodes.length !== payments.length) {
      throw new httpError.NotFoundError('支付方式不存在, 请检查支付代码是否正确');
    }
    app.update({ paymentCodes: uniqCodes });
    /// 更新支付的appKeys
    await Promise.all(payments.map(pm => {
      if (pm.appKeys.includes(app.key)) {
        return null;
      }
      return pm.update({ appKeys: uniq(pm.appKeys.concat(app.key)) })
    }))
    return app;
  }

  /** 取消订单 */
  async cancel(order: Order) {
    switch (order.state) {
      case OrderState.closed: 
        throw new httpError.BadRequestError('订单已关闭');
      case OrderState.init:
      case OrderState.paying: 
        // 取消支付单
        await this.payServer.cancelOrdersPayOrder(order.orderSn);
        // 取消订单
        await order.update({ state: OrderState.closed });
        break;
      default:
        throw new httpError.BadRequestError('订单已付款，请走退货退款流程');
    }
    return order;
  }

  /** 强制取消订单 */
  async cancelForce(order: Order) {
    await order.update({ state: OrderState.closed });
    //  取消支付单
    await this.payServer.cancelOrdersPayOrder(order.orderSn);
    // TODO: 取消退款单  -- 暂不支持退款
    return order;
  }

  async complete(order: Order) {
    await order.update({ state: OrderState.completed });
    return order;
  }

  /** 发货 */
  async ship(order: Order) {
    // 调一个其他服务的发货接口，成功即完成发货
    if (order.shipHookUrl) {
      await apis.axios.post(order.shipHookUrl).catch((err: AxiosResponse) => {
        this.logger.error(`订单[${order.orderSn}]发货失败`, err.data?.message);
        throw new httpError.BadRequestError('发货失败');
      });
    }
    switch (order.procType) {
      case OrderProcessType.auto:
        await order.update({ state: OrderState.completed }); break;
      case OrderProcessType.manual:
        await order.update({ state: OrderState.receiving }); break;
      default:
        throw new httpError.BadRequestError('订单流程类型错误');
    }
    return order;
  }

  /** 等待发货 */
  async prepearShipOrder(order: Order) {
    /// 更改订单状态 为 待发货
    await order.update({ state: OrderState.preparing });
    /// TODO: 通知卖家发货
    if (order.prepearShipHookUrl) {
      await apis.axios.post(order.prepearShipHookUrl).catch((err: AxiosResponse) => {
        this.logger.error(`订单[${order.orderSn}]通知发货失败`, err.data?.message);
        throw new httpError.BadRequestError('通知发货失败');
      });
    }
    return order;
  }
}
