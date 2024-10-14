import { ILogger, Inject, Logger, Provide, httpError } from "@midwayjs/core";
import { genSnowflakeId, nanoRandom } from "../utils/cipher";
import Order from "../models/models/Order.model";
import PayState, { OrderState, PaymentPlatform } from "../define/enums";
import PayOrder from "../models/models/PayOrder.model";
import { Op } from "sequelize";
import { ApplicationService } from "./application.service";
import moment from "moment";
import { PAY_EXPIRE_LIMIT } from "../define/consts";
import { CreatePayOrderDTO, WxPayCallbackDTO } from "../dto/payOrder.dto";
import { WxService } from "./wx.service";
import { OrderService } from "./order.service";
import { MidwayLogger } from "@midwayjs/logger";

@Provide()
export class PayService {
  @Inject()
  appService: ApplicationService;

  @Inject()
  wxService: WxService;


  @Inject()
  orderService: OrderService;

  @Logger()
  logger: ILogger;

  /** 生成支付代号 */
  genPaySn(appId: number) {
    const orderSn = `${appId
      .toString()
      .padStart(2, "A")}${genSnowflakeId()}${nanoRandom(4)}`.toUpperCase();
    return orderSn;
  }
  /** 根据支付单号查找支付单 */
  async findByPaySn(paySn: string) {
    return PayOrder.findOne({
      where: {
        paySn: paySn,
      },
    });
  }

  /** 查找当前支付单 */
  async findValidPayOrder(orderSn: string, paymentCode: string) {
    return PayOrder.findOne({
      where: {
        orderSn: orderSn,
        paymentCode: paymentCode,
        expireTime: {
          [Op.gt]: new Date(),
        },
        state: PayState.paying,
      },
      order: [["id", "desc"]],
    });
  }
  /** 取消订单的所有支付单 */
  async cancelOrdersPayOrder(orderSn: string) {
    return PayOrder.update(
      {
        state: PayState.closed,
      },
      {
        where: {
          orderSn: orderSn,
          state: PayState.paying,
        },
      }
    );
  }

  /** 创建支付单 */
  async findOrCreatePayOrder(order: Order, params: CreatePayOrderDTO) {
    const { title, payCode } = params;
    if (order.state === OrderState.closed) {
      throw new httpError.ConflictError("发起支付失败，订单已关闭");
    }
    if (order.state !== OrderState.init && order.state !== OrderState.paying) {
      throw new httpError.ConflictError("发起支付失败，订单已支付");
    }
    /** 订单关联应用 */
    const app = await this.appService.findByKey(order.appKey);
    if (!app) {
      throw new httpError.BadRequestError("应用不存在");
    }
    /** 可用的支付方式 */
    const validPayment = await this.appService.getValidPayment(app, payCode);
    if (!validPayment) {
      throw new httpError.BadRequestError("支付方式无效或不存在");
    }
    /** 当前订单的支付单 */
    const curValidPayOrder = await this.findValidPayOrder(
      order.orderSn,
      validPayment.code
    );
    if (curValidPayOrder) {
      return curValidPayOrder;
    }
    const expireTime = moment().add(PAY_EXPIRE_LIMIT, "millisecond").toISOString();
    // 创建支付单
    const payOrder = await PayOrder.create({
      appKey: order.appKey,
      orderSn: order.orderSn,
      paySn: this.genPaySn(app.id),
      paymentCode: validPayment.code,
      expireTime: expireTime,
      amount: order.amount,
      platform: validPayment.platform,
      title: title || order.bizName || app.name,
    });

    await order.update({
      paymentCode: payOrder.paymentCode,
      paySn: payOrder.paySn,
      state: OrderState.paying,
    });

    return payOrder;
  }

  // 取消支付单
  async cancelPayOrder(payOrder: PayOrder) {
    switch (payOrder.state) {
      case PayState.success:
        // 支付成功，退款
        throw new httpError.ConflictError("支付单已支付，无法取消");
        break;
      case PayState.fail:
        throw new httpError.ConflictError("支付单已失败，无法取消");
        break;
      case PayState.closed:
        throw new httpError.ConflictError("支付单已关闭");
        break;
      default:
        await payOrder.update({
          state: PayState.closed,
        });
        await Order.update(
          {
            paymentCode: null,
            paySn: null,
          },
          {
            where: {
              orderSn: payOrder.orderSn,
            },
          }
        );
    }

    return payOrder;
  }

  async getPayParams(payOrder: PayOrder) {
    switch (payOrder.platform) {
      case PaymentPlatform.wechat: {
        // 前端调起支付需要的参数
        /** 微信下单 */
        const prepayId = await this.wxService.wechatPrepay({
          description: payOrder.title,
          paySn: payOrder.paySn,
          time_expire: moment(payOrder.expireTime).toISOString(),
          attach: "",
          payAmount: payOrder.amount,
          // TODO: openid
          openid: "",
        });
        if (!prepayId) {
          throw new httpError.BadRequestError("微信支付下单失败");
        }
        return this.wxService.getMiniPayParams(prepayId);
      }
      default:
        throw new httpError.ForbiddenError(
          `支付方式(${payOrder.platform})不支持`
        );
    }
  }


  async handleWxPayCallback(payOrder: PayOrder, callbackData: WxPayCallbackDTO) {
    const isSuccess = callbackData.event_type === 'TRANSACTION.SUCCESS';
    if (!isSuccess) {
      this.logger.info(`微信支付回调，订单号:${payOrder.orderSn}, 支付单号:${payOrder.paySn}, 支付状态:${callbackData.event_type}, 失败原因:${callbackData.summary}`)
      await payOrder.update({
        state: PayState.fail,
        failReason: callbackData.summary
      });
    } else {
      await payOrder.update({
        state: PayState.success,
      });
      // TODO: 处理订单流转下一步状态
      // TODO：将消息发到mq上，
      
    }
  }
}
