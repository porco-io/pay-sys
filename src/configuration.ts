import * as dotenv from 'dotenv';
import { join } from 'path';
import appRootPath from 'app-root-path';
import { EnvUtil } from './utils/env';

console.log(process.env.NODE_ENV)
const config = dotenv.config({
  path: join(appRootPath.path, `env/.env.${process.env.NODE_ENV || 'production'}`),
});
if (!EnvUtil.isTest) {
  console.log(config.parsed);
}

import { Configuration, App, type IMidwayContainer, Config, Logger, Inject } from '@midwayjs/core';

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

  async onReady(container: IMidwayContainer) {
    await initAdminUser(this.dataSource);

    this.app.useMiddleware([
      ReportMiddleware,
      ErrorMiddleware,
      ResponseMiddleware,
      AuthMiddleware,
    ]);
    // const users = await this.dataSource.models.User.findAll({
    //   logging: console.log,
    // });
    // console.log('users', users);
  }

  async onStop(container: IMidwayContainer) {
  }

}
