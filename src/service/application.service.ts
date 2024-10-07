import { Provide } from '@midwayjs/core';
import { isNil, omitBy } from 'lodash';
import { CreateApplicationDTO, QueryAppPageListDTO, UpdateApplicationDTO } from '../dto/application.dto';
import Application, { applicationScope } from '../models/models/Application.models';

@Provide()
export class ApplicationService {
  
  /** 获取app */
  async findById(id: number) {
    const payment = await Application.findByPk(id);
    return payment;
  }

  /** 获取app */
  async findByKey(key: string) {
    const payment = await Application.findOne({
      where: {
        key: key,
      },
    });
    return payment;
  }
  /** 创建 */
  async create(params: CreateApplicationDTO) {
    const app = await Application.create(params);
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
    });

    return {
      count,
      page,
      size,
      total: Math.ceil(count / size) || 1,
      list: rows.map(item => item.secure()),
    }
  }

}
