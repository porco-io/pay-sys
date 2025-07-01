import { ILogger, Inject, Logger, Provide, httpError } from "@midwayjs/core";
import { genSnowflakeId, nanoRandom } from "../utils/cipher";
import Order from "../models/models/Order.model";
import { OrderState, PaymentPlatform, PayState } from "../define/enums";
import PayOrder from "../models/models/PayOrder.model";
import { Op } from "sequelize";
import { ApplicationService } from "./application.service";
import moment from "moment";
import { PAY_EXPIRE_LIMIT } from "../define/consts";
import { CreatePayOrderDTO, WxPayCallbackDTO, WxPayParamsDTO } from "../dto/pay.dto";
import { WxService } from "./wx.service";
import { AliService } from './ali.service';
import { OrderService } from "./order.service";
import Payment from "../models/models/Payment.model";

@Provide()
export class PayService {
  @Inject()
  appService: ApplicationService;

  @Inject()
  wxService: WxService;

  @Inject()
  aliService: AliService;

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
      include: [
        {
          model: Payment,
          attributes: ["id", "code", "name", "icon"],
        },
      ],
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
    const { title, paymentCode } = params;
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
    const validPayment = await this.appService.getValidPayment(app, paymentCode);
    if (!validPayment) {
      throw new httpError.BadRequestError("支付方式无效或不存在");
    }
    /** 当前订单的支付单 */
    const curValidPayOrder = await this.findValidPayOrder(
      order.orderSn,
      validPayment.code
    );
    if (curValidPayOrder) {
      await curValidPayOrder.update({
        payParams: params.payParams,
      });
      return curValidPayOrder;
    }
    const expireTime = moment()
      .add(PAY_EXPIRE_LIMIT, "millisecond")
      .toISOString();
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
      payParams: params.payParams,
    });

    // 更新订单的支付code、支付单号、状态
    await order.update({
      paymentCode: payOrder.paymentCode,
      paySn: payOrder.paySn,
      state: OrderState.paying,
    });
    await payOrder.reload({
      include: [
        {
          model: Payment,
          attributes: ["id", "code", "name", "icon"],
        },
      ],
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

  // 获取微信支付参数
  async getPayParams(payOrder: PayOrder) {
    if (!payOrder.payment) {
      await payOrder.reload({
        include: [Payment],
      });
    }
    const paymentConfig = (payOrder.payment.details ?? {});
    switch (payOrder.platform) {
      // 微信支付
      case PaymentPlatform.wechat: {
        return this.wxService.getWxPayParams(payOrder, paymentConfig as IStruct.WxPayConfig);
      } break;
      // 支付宝支付
      case PaymentPlatform.alipay:
        return this.aliService.getAliPayParams(payOrder);
        break;
      default:
        throw new httpError.ForbiddenError(
          `支付方式(${payOrder.platform})不支持`
        );
    }
  }

  async handleWxPayCallback(
    payOrder: PayOrder,
    callbackData: WxPayCallbackDTO
  ) {
    const isSuccess = callbackData.event_type === "TRANSACTION.SUCCESS";
    if (!isSuccess) {
      this.logger.info(
        `微信支付回调，订单号:${payOrder.orderSn}, 支付单号:${payOrder.paySn}, 支付状态:${callbackData.event_type}, 失败原因:${callbackData.summary}`
      );
      await payOrder.update({
        state: PayState.fail,
        failReason: callbackData.summary,
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
