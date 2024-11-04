import { ILogger, Inject, Logger, Provide} from "@midwayjs/core";
import PayOrder, { payOrderScope } from "../models/models/PayOrder.model";
import { ApplicationService } from "./application.service";
import { WxService } from "./wx.service";
import { OrderService } from "./order.service";
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
