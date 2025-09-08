import * as dotenv from 'dotenv';
import { join } from 'path';
import appRootPath from 'app-root-path';
import { EnvUtil } from './utils/env';

const config = dotenv.config({
  path: [
    join(appRootPath.path, `env/.env.${process.env.NODE_ENV || 'production'}`),
    join(appRootPath.path, `env/.env`)
  ],
});
if (!EnvUtil.isTest) {
  console.log(config.parsed);
}

import { Configuration, App, type IMidwayContainer, Config, Logger, Inject, IMidwayApplication } from '@midwayjs/core';

import * as koa from '@midwayjs/koa';
import * as validate from '@midwayjs/validate';
import * as info from '@midwayjs/info';
import rabbitmq from '@midwayjs/rabbitmq';
import * as jwt from '@midwayjs/jwt';
import * as i18n from '@midwayjs/i18n';
import * as swagger from '@midwayjs/swagger';
import { ReportMiddleware } from './middleware/report.middleware.js';
import * as sequelize from '@midwayjs/sequelize';
import * as redis from '@midwayjs/redis';
import * as crossDomain from '@midwayjs/cross-domain';
import * as cacheManager from '@midwayjs/cache-manager';

import { Sequelize } from 'sequelize-typescript';
import { initAdminUser } from './models/setup';
import { ErrorMiddleware } from './middleware/error.middleware';
import { ResponseMiddleware } from './middleware/response.middleware';
import { AuthMiddleware } from './middleware/auth.middleware';
import { initLogger, logLevels } from './utils/loggers';
import { ConsulService } from './service/consul.service';
import { RabbitmqService } from './service/rabbitmq';
import { AdminUser } from './models/models/AdminUser.model';

@Configuration({
  imports: [
    koa,
    crossDomain,
    sequelize,
    redis,
    validate,
    jwt,
    i18n,
    swagger,
    cacheManager,
    {
      component: rabbitmq,
      enabledEnvironment: ['local', 'dev', 'development', 'production'],
    },
    {
      component: info,
      enabledEnvironment: ['local'],
    },
  ],
  importConfigs: [join(__dirname, './config/')],
})
export class MainConfiguration {
  @App('koa')
  app: koa.Application;

  @sequelize.InjectDataSource()
  dataSource: Sequelize;

   /** 修改配置 */
   async onConfigLoad(container: IMidwayContainer, mainApp?: IMidwayApplication) {
    console.log('当前环境: ', process.env.NODE_ENV);
    const consulService = await container.getAsync(ConsulService, [mainApp.getProjectName()]);
    // 从远端加载配置
    const config = await consulService.buildMidwayConfig();
    mainApp.addConfigObject(config);
  }

  async onReady(container: IMidwayContainer, mainApp?: IMidwayApplication) {
    initLogger({
      level: logLevels.INFO.levelStr,
      logDir: join(appRootPath.path, EnvUtil.isTest ? 'logs/test' : 'logs'),
    });
    await AdminUser.initAdminUser();
    // await container.getAsync(RabbitmqService);
    this.app.useMiddleware([
      ReportMiddleware,
      ErrorMiddleware,
      ResponseMiddleware,
      AuthMiddleware,
    ]);
  }

  async onServerReady(container: IMidwayContainer, mainApp?: IMidwayApplication): Promise<void> {
    const consulService = await container.getAsync(ConsulService, [mainApp.getProjectName()]);
    consulService.register();
  }

  async onStop(container: IMidwayContainer) {
  }

}
