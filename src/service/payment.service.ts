import { Provide, httpError } from '@midwayjs/core';
import { CreatePaymentDTO, QueryPaymentPageListDTO, UpdatePaymentDTO } from '../dto/payment.dto';
import Payment, { paymentScope } from '../models/models/Payment.model';
import { isNil, omitBy } from 'lodash';
import { v4 } from 'uuid';

@Provide()
export class PaymentService {
  /** 生成支付代号 */
  genPayCode() {
    const randomId = v4().replace(/-/g, '').slice(0, 8).toUpperCase();
    return randomId
  }
  /** 创建支付 */
  async findByCode(name: string) {
    const payment = await Payment.findOne({
      where: {
        name: name,
      },
    });
    return payment;
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
      }
    });
    if (!created) {
      return this.createPayment(params);
      // throw new httpError.ConflictError('支付方式已存在');
    }

    return payment;
  }

  /** 更新支付 */
  async updatePayment(payment: Payment, params: UpdatePaymentDTO) {
    // if (params.name && payment.name !== params.name) {
    //   const sameNamePayment = await Payment.findOne({
    //     where: {
    //       name: params.name,
    //     },
    //     attributes: ['id'],
    //   });
    //   if (sameNamePayment) {
    //     throw new httpError.ConflictError('名称已被使用');
    //   }
    // }
    await payment.update(omitBy(params, isNil));
    return payment;
  }


  async pageList(params: QueryPaymentPageListDTO): Promise<IStruct.PageList<Payment>> {
    const { page, size } = params;

    const { rows, count } = await Payment.scope([
      paymentScope.method('eq_name', params.name),
      paymentScope.method('eq_platform', params.platform),
      paymentScope.method('in_appIds', params.appId),
    ]).findAndCountAll({
      offset: (page - 1) * size,
      limit: size,
      attributes: {
        exclude: ['details']
      }
    });

    return {
      count,
      page,
      size,
      total: Math.ceil(count / size) || 1,
      list: rows,
    }
  }
}
