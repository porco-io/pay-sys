import { Inject, Controller, Queries, Post, Patch, Param, Body, httpError, Del, Get} from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { LoginRequired } from '../middleware/auth.middleware';
import { CreateOrderDTO,  } from '../dto/order.dto';
import { CreateApplicationDTO, QueryAppPageListDTO, UpdateApplicationDTO } from '../dto/application.dto';
import { ApplicationService } from '../service/application.service';

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

  /** 更新应用部分信息 */
  @Patch('/:key', {
    description: '更新应用',
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
