import { httpError, Provide } from "@midwayjs/core";
import { addStorage, StorageKeys } from "../utils/storage";
import { getWxAccessToken, getWxPaySign } from "../utils/wxpay";
import { apis } from "../api/apis";
import moment from "moment";
import { models } from "../models/models";
import PayOrder from "../models/models/PayOrder.model";
import { nanoRandom } from "../utils/cipher";
import { AxiosRequestConfig } from "axios";

@Provide()
export class WxService {
  async checkPayParams() {}
  // /** 通过支付单号查找 */
  // async findByPaySn(paySn: string) {
  //   return PayOrder.({
  //     where: {
  //       paySn: paySn,
  //     },
  //     select: basePayOrderSelects,
  //   });
  // }
  // /** 通过订单编号查询支付单 */
  // async findByOrderSn(orderSn: string) {
  //   return this.models.payOrder.findFirst({
  //     where: {
  //       orderSn: orderSn,
  //       payState: PAY_STATE.waiting,
  //     },
  //     orderBy: {
  //       createdAt: "desc",
  //     },
  //     select: basePayOrderSelects,
  //   });
  // }
  // /** 创建支付单编号 */
  // async generatePaySn(isTest = false) {
  //   /** 支付单全局计数 */
  //   const newCount = await this.service.tool.getIncreasedGlobalCount(
  //     isTest ? GLOBAL_COUNT.paySn_test : GLOBAL_COUNT.paySn
  //   );
  //   /** 订单计数6位 */
  //   const countSn = newCount.toString().padStart(6, "0");
  //   /** 日期信息10位 */
  //   const dateInfo = moment().format("YYYYMMDD");
  //   const rand = random(0, 99, false);
  //   // 共18位 + 4位?
  //   return `P${dateInfo}${countSn}${rand}${isTest ? "test" : ""}`;
  // }
  // /** 查询或创建支付单 */
  // async findOrCreatePayOrder(order: Order) {
  //   /** 订单状态不是待支付，抛错 */
  //   if (order.orderState !== ORDER_STATE.paying) {
  //     throw new httpError.ConflictError("创建支付单失败，订单已支付");
  //   }
  //   const curPayOrder = await this.findByOrderSn(order.orderSn);
  //   if (curPayOrder) {
  //     // 如果未过期，则返回
  //     const isExpired = moment(curPayOrder.expireTime).isBefore(moment());
  //     if (!isExpired) {
  //       return curPayOrder;
  //     } else {
  //       // 更新支付单状态为支付超时
  //       this.models.payOrder.update({
  //         where: {
  //           paySn: curPayOrder.paySn,
  //         },
  //         data: {
  //           payState: PAY_STATE.fail,
  //           failReason: "支付超时",
  //         },
  //       });
  //     }
  //   }
  //   /**
  //    * 创建新的支付单
  //    *
  //    */
  //   /** 生成唯一支付单号 */
  //   const paySn = await this.generatePaySn();
  //   /** 创建支付单 */
  //   const payOrder = await this.models.payOrder.create({
  //     data: {
  //       paySn: paySn,
  //       expireTime: moment().add(30, "minute").toDate(),
  //       payAmount: order.payAmount,
  //       order: {
  //         connect: {
  //           orderSn: order.orderSn,
  //         },
  //       },
  //       owner: {
  //         connect: {
  //           uuid: order.ownerId,
  //         },
  //       },
  //       source: PAY_SOURCE.wechat,
  //       payState: PAY_STATE.waiting,
  //     },
  //     select: basePayOrderSelects,
  //   });
  //   return payOrder;
  // }

  /** 微信支付下单： 获取prepay_id */
  async wechatPrepay(params: {
    /** 商品描述 */
    description: string;
    /** 支付单 */
    paySn: string;
    /** 内部订单号 */
    orderSn: string;
    /** 过期时间 */
    time_expire: string;
    /** 附加数据 */
    attach: string;
    /** 支付金额 */
    payAmount: number;
    /** openId */
    openid: string;
    appId: string;
    mchId: string;
    serialNo: string;
    pem: string;
  }) {
    /** 支付回调地址 */
    const payCallback = `${process.env.APP_HOST}/v1/pay/wxCallback/${params.paySn}`;
    const wxPayParams = {
      mchid: params.mchId,
      appid: params.appId,
      description: params.description ?? "",
      out_trade_no: params.orderSn,
      /* 交易结束时间 */
      time_expire: params.time_expire,
      attach: params.attach ?? "",
      notify_url: payCallback,
      amount: {
        total: params.payAmount || 1,
        currency: "CNY",
      },
      payer: {
        openid: params.openid,
      },
    };

    const resp = await apis.wxShop.post<{
      prepay_id: string;
      code?: string;
      message?: string;
    }>("/v3/pay/transactions/jsapi", wxPayParams, {
      validateStatus: (status) => status < 500,
      states: {
        mchId: params.mchId,
        serialNo: params.serialNo,
        pem: params.pem,
      }
    } as AxiosRequestConfig & { states: { [key: string]: string } });
    // this.logger.info("prepay_id:", resp.data);
    if (!resp.data.prepay_id) {
      throw new httpError.BadRequestError(`微信下单失败, ${resp.data.message}`);
    }
    return resp.data.prepay_id;
  }

  /** 获取客户端调起支付所需要的参数 */
  async getMiniPayParams(miniId: string, prepay_id: string) {
    const timeStamp = Math.round(Date.now() / 1000).toString();
    const payParams = {
      appId: miniId,
      timeStamp: timeStamp,
      nonceStr: nanoRandom(8),
      package: `prepay_id=${prepay_id}`,
      signType: "RSA",
      paySign: "",
    };

    payParams.paySign = getWxPaySign(payParams);

    return payParams;
  }

  // /** 处理支付成功 */
  // async handlePaySuccess(
  //   payOrder: PayOrder | string,
  //   updates: {
  //     // 支付成功时间
  //     payTime: string;
  //     // 微信内部支付订单
  //     wxPaySn?: string;
  //   }
  // ) {
  //   // 查询支付单
  //   if (typeof payOrder === "string") {
  //     payOrder = (await this.findByPaySn(payOrder))!;
  //     if (!payOrder) {
  //       throw new httpError.NotFoundError("支付单未找到");
  //     }
  //   }
  //   // 更新支付单状态
  //   const paidPayOrder = await this.models.payOrder.update({
  //     where: {
  //       paySn: payOrder.paySn,
  //     },
  //     data: {
  //       payState: PAY_STATE.success,
  //       ...updates,
  //     },
  //   });
  //   // 更新订单状态(异步)
  //   this.service.order.handlePaid(paidPayOrder);
  // }

  // /** 转账到个人 */
  // async transforPerson(params: {
  //   out_batch_no: string;
  //   batch_name: string;
  //   remark?: string;
  //   /** 总金额，单位分 */
  //   amount: number;
  //   /** 转账笔数 */
  //   total_num?: number;
  //   /** 明细列表 */
  //   transfer_detail_list: {
  //     out_detail_no: string;
  //     transfer_amount: number;
  //     transfer_remark: string;
  //     openid: string;
  //     user_name?: string;
  //     user_id_card?: string;
  //   }[];
  // }) {
  //   const resp = await apis.wxShop
  //     .post<{
  //       out_batch_no: string;
  //       batch_id: string;
  //       create_time: string;
  //     }>(
  //       "/v3/transfer/batches",
  //       {
  //         mchid: process.env.WX_MCH_ID,
  //         appid: process.env.WX_APP_ID,
  //         out_batch_no: params.out_batch_no,
  //         batch_name: params.batch_name,
  //         batch_remark: params.remark || "",
  //         total_amount: params.amount,
  //         total_num: params.total_num || 1,
  //         transfer_detail_list: params.transfer_detail_list,
  //       },
  //       {
  //         headers: {
  //           "Content-Type": "application/json",
  //           Accept: "application/json",
  //         },
  //       }
  //     )
  //     .catch((err) => {
  //       const errData = (err as AxiosError<{ code: string; message: string }>)
  //         .response?.data;

  //       throw new this.errors.HttpError({
  //         message:
  //           errData?.message ??
  //           `发起转账失败，error: ${(err as Error).message}`,
  //         type: this.errors.ERRORS.SERVICE_DISABLED,
  //       });
  //     });

  //   return resp.data;
  // }
}
