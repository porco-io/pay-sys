import { type MidwayConfig } from '@midwayjs/core';

export default () => ({
  // use for cookie sign key, should change to your own and keep security
  keys: '1726669907781_3035',
  koa: {
    port: Number(process.env.SERVER_PORT),
  },
  sequelize: {
    dataSource: {
      // 第一个数据源，数据源的名字可以完全自定义
      default: {
        sync: true,
      },
    },
  },
} as MidwayConfig);
