import { ILogger, Inject, Logger, Provide, httpError } from "@midwayjs/core";
import { genSnowflakeId, nanoRandom } from "../utils/cipher";
import Order from "../models/models/Order.model";
import {
  OrderState,
  PaymentPlatform,
  PaymentType,
  PayState,
} from "../define/enums";
import PayOrder, { payOrderScope } from "../models/models/PayOrder.model";
import { Op } from "sequelize";
import { ApplicationService } from "./application.service";
import moment from "moment";
import { PAY_EXPIRE_LIMIT } from "../define/consts";
import {
  CreatePayOrderDTO,
  WxPayCallbackDTO,
  WxPayParamsDTO,
} from "../dto/pay.dto";
import { WxService } from "./wx.service";
import { OrderService } from "./order.service";
import { MidwayLogger } from "@midwayjs/logger";
import Payment from "../models/models/Payment.model";
import { WxPayUtil } from "../utils/wxpay";
import { QueryPayOrderPageListDTO } from "../dto/payOrder.dto";

@Provide()
export class PayOrderService {
  @Inject()
  appService: ApplicationService;

  @Inject()
  wxService: WxService;

  @Inject()
  orderService: OrderService;

  @Logger()
  logger: ILogger;

  async findBySn(paySn: string) {
    return await PayOrder.findOne({
      where: {
        paySn,
      },
    });
  }

  async findPageList(
    params: QueryPayOrderPageListDTO
  ): Promise<IStruct.PageList<PayOrder>> {
    const {
      page,
      size,
      platform,
      orderSn,
      paySn,
      paymentCode,
      state,
      title,
      minAmount,
      maxAmount,
      minPayTime,
      maxPayTime,
      isExpired,
      sortBy,
    } = params;
    const { rows, count } = await PayOrder.scope([
      payOrderScope.method("eq_state", state),
      payOrderScope.method("eq_orderSn", orderSn),
      payOrderScope.method("eq_paySn", paySn),
      payOrderScope.method("is_expired", isExpired),
      payOrderScope.method("eq_paymentCode", paymentCode),
      payOrderScope.method("eq_platform", platform),
      payOrderScope.method("like_title", title),
      payOrderScope.method("between_amount", [minAmount, maxAmount]),
      payOrderScope.method('between_payTime', [minPayTime, maxPayTime]),
      payOrderScope.method('sort', sortBy),
    ]).findAndCountAll({
      offset: (page - 1) * size,
      limit: size,
      order: [["id", "DESC"]],
      attributes: {
        exclude: ['payParams']
      }
    });

    return {
      count,
      page,
      size,
      total: Math.ceil(count / size) || 1,
      list: rows,
    };
  }
}
