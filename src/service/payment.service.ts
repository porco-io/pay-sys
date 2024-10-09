import { Provide, httpError } from "@midwayjs/core";
import {
  CreatePaymentDTO,
  QueryPaymentPageListDTO,
  UpdatePaymentDTO,
} from "../dto/payment.dto";
import Payment, { paymentScope } from "../models/models/Payment.model";
import { isNil, omitBy } from "lodash";
import { v4 } from "uuid";

@Provide()
export class PaymentService {
  /** 生成支付代号 */
  genPayCode() {
    const randomId = v4().replace(/-/g, "").slice(0, 8).toUpperCase();
    return randomId;
  }
  /** 查询支付方式 - 通过名称 */
  async findByName(name: string) {
    const payment = await Payment.findOne({
      where: {
        name: name,
      },
    });
    return payment;
  }
  /** 查询支付方式 - 通过code */
  async findByCode(code: string) {
    const payment = await Payment.findOne({
      where: {
        code: code,
      },
    });
    return payment;
  }

  /** 查询支付方式数组 - 通过code数组 */
  async findByCodes(codes: string[]) {
    const payments = await Payment.scope([
      paymentScope.method("in_codes", codes),
    ]).findAll();
    return payments;
  }
  /** 创建支付 */
  async createPayment(params: CreatePaymentDTO) {
    const payCode = this.genPayCode();
    const [payment, created] = await Payment.findOrCreate({
      where: {
        code: payCode,
      },
      defaults: {
        ...params,
      },
    });
    if (!created) {
      return this.createPayment(params);
      // throw new httpError.ConflictError('支付方式已存在');
    }

    return payment;
  }

  /** 更新支付 */
  async updatePayment(payment: Payment, params: UpdatePaymentDTO) {
    await payment.update(omitBy(params, isNil));
    return payment;
  }

  async pageList(
    params: QueryPaymentPageListDTO
  ): Promise<IStruct.PageList<Payment>> {
    const { page, size } = params;
    console.log(params);
    const { rows, count } = await Payment.scope([
      paymentScope.method("eq_name", params.name),
      paymentScope.method("eq_platform", params.platform),
      paymentScope.method("in_appKeys", params.appKey),
    ]).findAndCountAll({
      offset: (page - 1) * size,
      limit: size,
      attributes: {
        exclude: ["details"],
      },
      paranoid: !params.includeDisabled,
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
