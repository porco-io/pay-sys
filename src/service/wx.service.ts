import { httpError, ILogger, Logger, Provide } from "@midwayjs/core";
import { addStorage, StorageKeys } from "../utils/storage";
import { getWxAccessToken, getWxPaySign, WxPayUtil } from "../utils/wxpay";
import { apis } from "../api/apis";
import moment from "moment";
import { models } from "../models/models";
import PayOrder from "../models/models/PayOrder.model";
import { nanoRandom } from "../utils/cipher";
import { AxiosRequestConfig } from "axios";
import { Caching } from "@midwayjs/cache-manager";
import Payment from "../models/models/Payment.model";
import { PaymentType } from "../define/enums";
import { WxPayParamsDTO } from "../dto/pay.dto";

@Provide()
export class WxService {
  @Logger()
  logger: ILogger;

  /** 获取微信支付前端调起所需数据 */
  // TODO: payOrder不应作为传入参数，此处是为了方便，后续需要解耦
  async getWxPayParams(payOrder: PayOrder, paymentConfig: IStruct.WxPayConfig) {
    const payParams = payOrder.payParams as WxPayParamsDTO;
    if (!paymentConfig.MCH_ID) {
      throw new httpError.BadRequestError(
        "支付参数错误, 请检查支付配置"
      );
    }
    const wxPayUtil = new WxPayUtil(paymentConfig as IStruct.WxPayConfig);
    // TODO: 对repayOptions建立类型，由外部传入，因为它还有很多非必填项，此处无法全部覆盖
    const prepayOptions = {
      description: payOrder.title,
      paySn: payOrder.paySn,
      orderSn: payOrder.orderSn,
      time_expire: moment(payOrder.expireTime).toISOString(),
      attach: "",
      payAmount: payOrder.amount,
      openid: payParams.openId,
    };
    this.logger.debug("支付类型", payParams.payType);
    this.logger.debug("请求预付订单参数", prepayOptions);
    this.logger.debug("支付类型的补充参数", payParams);
    
    switch (payParams.payType) {
      case PaymentType.app: 
        return wxPayUtil.appPrepay(prepayOptions);
      case PaymentType.mini:
      case PaymentType.jsapi: {
        if (!payParams.openId) {
          throw new httpError.BadRequestError("微信支付参数错误, 缺少OpenId");
        }
        if (!payParams.appId) {
          throw new httpError.BadRequestError("微信支付参数错误, 缺少appId");
        }
        const prepayId = await wxPayUtil.miniOrJsPrepay(prepayOptions);
        return wxPayUtil.getMiniPayParams(payParams.appId, prepayId);
      }
      // case PaymentType.h5:
      //   return wxPayUtil.h5Prepay({
      //     ...prepayOptions,
      //     scene_info: {
      //     }
      //   });
      case PaymentType.native:
        return wxPayUtil.nativePrepay(prepayOptions);
      default:
        throw new httpError.ForbiddenError(
          `微信支付类型(${payParams.payType})不支持`
        );
    }
  }
}
