import { Inject, Controller, Queries, Post, Patch, Param, Body, httpError, Del, Get} from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { LoginRequired } from '../middleware/auth.middleware';
import { CreateApplicationDTO, QueryAppPageListDTO, SetAppPaymentsDTO, UpdateApplicationDTO } from '../dto/application.dto';
import { ApplicationService } from '../service/application.service';
import { GetAppPeymentsDTO } from '../dto/payment.dto';

@Controller('/api/application')
export class PaymentController {
  @Inject()
  ctx: Context;

  @Inject()
  appService: ApplicationService;

  /** 获取应用详情 */
  @Get('/:key', {
    description: '获取应用详情',
    middleware: [
      LoginRequired
    ]
  })
  async find(@Param('key') key: string) {
    const app = await this.appService.findByKey(key);
    if (!app) {
      throw new httpError.NotFoundError('应用不存在')
    }
    return app.secure();
  }

  /** 获取应用秘钥 */
  @Get('/:key/secret', {
    description: '获取应用秘钥',
    middleware: [
      LoginRequired
    ]
  })
  async getSecret(@Param('key') key: string) {
    const app = await this.appService.findByKey(key);
    if (!app) {
      throw new httpError.NotFoundError('应用不存在')
    }
    return app.secret;
  }

  /** 获取支付方式 */
  @Get('/:key/payments', {
    description: '获取应用支付方式',
    middleware: [
      LoginRequired
    ]
  })
  async getPayments(@Param('key') key: string, @Queries() params: GetAppPeymentsDTO) {
    const { includeDisabled } = params;
    const app = await this.appService.findByKey(key);
    if (!app) {
      throw new httpError.NotFoundError('应用不存在')
    }
    const payments = await this.appService.getAppPayments(app, includeDisabled);
    return payments;
  }

  /** 获取应用分页列表 */
  @Get('/pageList', {
    description: '获取应用分页列表',
    middleware: [
      LoginRequired
    ]
  })
  async pageList(@Queries() params: QueryAppPageListDTO) {
    const pageData = await this.appService.pageList(params);
    return pageData;
  }
  /** 创建应用 */
  @Post('/', {
    description: '创建应用',
    middleware: [
      LoginRequired
    ]
  })
  async create(@Body() params: CreateApplicationDTO) {
    const app = await this.appService.create(params);
    return app.secure();
  }

  @Patch('/:key', {
    description: '更新应用部分信息',
    middleware: [
      LoginRequired
    ]
  })
  async update(@Param('key') key: string, @Body() params: UpdateApplicationDTO) {
    const app = await this.appService.findByKey(key);
    if (!app) {
      throw new httpError.NotFoundError('应用不存在')
    }
    await this.appService.update(app, params);
    return app.secure();
  }

  @Patch('/:key/payments', {
    description: '更新应用支付方式',
    middleware: [
      LoginRequired
    ]
  })
  async setAppPayments(@Param('key') key: string, @Body() params: SetAppPaymentsDTO) {
    const app = await this.appService.findByKey(key);
    if (!app) {
      throw new httpError.NotFoundError('应用不存在')
    }
    await this.appService.setAppPayments(app, params.paymentCodes);
    return app.secure();
  }

  /** 删除应用 */
  @Del('/:key', {
    description: '删除应用',
    middleware: [
      LoginRequired
    ]
  })
  async remove(@Param('key') key: string) {
    const app = await this.appService.findByKey(key);
    if (!app) {
      throw new httpError.NotFoundError('应用不存在')
    }
    await this.appService.remove(app);
    return app.secure();
  }
}
