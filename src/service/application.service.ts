import { httpError, Inject, Provide } from '@midwayjs/core';
import { isNil, omitBy, uniq } from 'lodash';
import { CreateApplicationDTO, QueryAppPageListDTO, UpdateApplicationDTO } from '../dto/application.dto';
import Application, { applicationScope } from '../models/models/Application.model';
import { PaymentService } from './payment.service';

@Provide()
export class ApplicationService {
  
  @Inject()
  paymentService: PaymentService;

  /** 获取app */
  async findById(id: number) {
    const app = await Application.findByPk(id);
    return app;
  }

  /** 获取app */
  async findByKey(key: string) {
    const app = await Application.findOne({
      where: {
        key: key,
      },
    });

    return app;
  }
  /** 创建 */
  async create(params: CreateApplicationDTO) {
    const { name, ...defaults } = params;
    const [app, created] = await Application.findOrCreate({
      where: {
        name: params.name,
      },
      defaults: defaults
    });
    if (!created) {
      throw new httpError.ConflictError('应用名称已存在');
    }
    return app;
  }

  async remove(app: Application) {
    await app.destroy();
    return app;
  }

  /** 更新app */
  async update(app: Application, params: UpdateApplicationDTO) {
    if (Object.keys(params).length) {
      await app.update(omitBy(params, isNil));
    }
    return app;
  }

  /** 查询分页列表 */
  async pageList(params: QueryAppPageListDTO): Promise<IStruct.PageList<Application>> {
    const { page, size } = params;

    const { rows, count } = await Application.scope([
      applicationScope.method('contains_name', params.name),
      applicationScope.method('exclude_secret'),
    ]).findAndCountAll({
      offset: (page - 1) * size,
      limit: size,
      order: [['id', 'asc']]
    });

    return {
      count,
      page,
      size,
      total: Math.ceil(count / size) || 1,
      list: rows.map(item => item.secure()),
    }
  }


  async setAppPayments(app: Application, paymentCodes: string[]) {
    if (!paymentCodes.length) {
      await app.update({ paymentCodes: [] })
      return app;
    }
    const uniqCodes = uniq(paymentCodes);
    const payments = await this.paymentService.findByCodes(uniqCodes, false);
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

  async getAppPayments(app: Application, includeDisabled = false) {
    const payments = await this.paymentService.findByCodes(app.paymentCodes, includeDisabled);
    return payments;
  }

  async getValidPayments(app: Application) {
    const payments = await this.paymentService.findByCodes(app.paymentCodes);
    return payments;
  }
  async getValidPayment(app: Application, paymentCode?: string) {
    if (paymentCode) {
      if (!app.paymentCodes.includes(paymentCode)) {
        throw new httpError.ForbiddenError(`不支持该支付方式[${paymentCode}]`);
      }
      const targetPayment = await this.paymentService.findByCode(paymentCode);
      if (!targetPayment) {
        throw new httpError.NotFoundError('支付方式不存在或已禁用');
      }
      return targetPayment;
    } else {
      const payments = await this.paymentService.findByCodes(app.paymentCodes);
      if (payments.length === 0) {
        throw new httpError.ForbiddenError('应用未配置支付方式');
      }
      if (payments.length !== 1) {
        throw new httpError.ForbiddenError('请指定一种支付方式');
      }
      return payments[0];
    }
  }
}
