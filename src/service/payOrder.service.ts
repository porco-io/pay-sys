import { Provide, httpError } from "@midwayjs/core";
import {
  CreatePaymentDTO,
  QueryPaymentPageListDTO,
  UpdatePaymentDTO,
} from "../dto/payment.dto";
import Payment, { paymentScope } from "../models/models/Payment.model";
import { isNil, omitBy } from "lodash";
import { genSnowflakeId, nanoRandom } from "../utils/cipher";

@Provide()
export class PayOrderService {
  /** 生成支付代号 */
  genPayOrderSn(appId: number) {
    const orderSn = `${appId.toString().padStart(2, 'A')}${genSnowflakeId()}${nanoRandom(4)}`
    return orderSn;
  }
  
}
