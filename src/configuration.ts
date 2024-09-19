import * as dotenv from 'dotenv';
import { join } from 'path';
import appRootPath from 'app-root-path';
import { EnvUtil } from './utils/env';

const config = dotenv.config({
  path: join(appRootPath.path, `env/.env.${process.env.NODE_ENV || 'production'}`),
});
if (!EnvUtil.isTest) {
  console.log(config.parsed);
}

import { Configuration, App, type IMidwayContainer, Config } from '@midwayjs/core';

import * as koa from '@midwayjs/koa';
import * as validate from '@midwayjs/validate';
import * as info from '@midwayjs/info';
// import { DefaultErrorFilter } from './filter/default.filter.js';
// import { NotFoundFilter } from './filter/notfound.filter.js';
import { ReportMiddleware } from './middleware/report.middleware.js';
import * as sequelize from '@midwayjs/sequelize';
import * as redis from '@midwayjs/redis';
import { Sequelize } from 'sequelize-typescript';

@Configuration({
  imports: [
    koa,
    sequelize,
    redis,
    validate,
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
    // add middleware
    this.app.useMiddleware([ReportMiddleware]);
    // add filter
    // this.app.useFilter([NotFoundFilter, DefaultErrorFilter]);
  }
}
