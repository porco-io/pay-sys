import {
  Config,
  Destroy,
  Init,
  Inject,
  Provide,
  Singleton,
} from '@midwayjs/core';
import Consul from 'consul';
import { MidwayConfig } from '@midwayjs/core';
import { v4 } from 'uuid';
import { SequelizeConfigOptions } from '@midwayjs/sequelize';
import yaml from 'js-yaml';
import dotenv from 'dotenv';
import { ILogger } from '@midwayjs/logger';
import { EnvUtil } from '../utils/env';
import { models } from '../models/models';
import { getTableName } from '../models/tool';
// import { models } from '../models/models';

interface IRemoteConfig {
  // # 数据库配置
  DB_DATABASE: string;
  DB_USERNAME: string;
  DB_PORT: number;
  DB_PASSWORD: string;
  DB_HOST: string;
  DB_DIALECT: string;
  // redis
  REDIS_HOST: string;
  REDIS_PORT: number;

  // # 服务端口
  SERVER_PORT: number;
  SERVER_HOST: string;
  JWT_SECRET: string;
  APP_KEYS: string;
  // # MQ
  MQ_HOST: string;
  MQ_VHOST: string;
  MQ_USERNAME: string;
  MQ_PASSWORD: string;

  // ## 默认admin用户密码
  ADMIN_PASSWORD: string;
  ADMIN_USERNAME: string;
}

@Singleton()
export class ConsulService {
  consul: Consul;

  @Config()
  config: MidwayConfig;

  @Inject()
  logger: ILogger;

  remoteConfig?: IRemoteConfig;

  projectName = '';

  constructor(projectName: string) {
    this.projectName = projectName;
  }

  @Init()
  async init() {
    this.consul = new Consul({
      host: process.env.CONSUL_HOST,
      port: Number(process.env.CONSUL_PORT),
    });
  }

  getConsulKey() {
    return `${this.projectName}/${process.env.NODE_ENV}${process.env.LOCAL_NAME ? `.${process.env.LOCAL_NAME}` : ''}`
  }

  async getRemoteConfig() {
    try {
      // 假设在Consul中有一个名为'my - app - config'的键值对存储配置信息
      const configText = await this.consul.kv.get(this.getConsulKey());
      if (configText?.Value) {
        // console.log(configText);
        const configFromConsul = yaml.load(
          configText.Value.toString()
        ) as IRemoteConfig;
        // 将从Consul获取的配置与MidwayJS的配置合并
        this.remoteConfig = configFromConsul;
        dotenv.populate(process.env, configFromConsul as any, {
          override: true,
        });
        this.logger.info('[Consul] 获取远程配置成功！', configFromConsul);
        return configFromConsul;
      } else {
        throw new Error('配置不存在');
      }
    } catch (error) {
      this.logger.error('[Consul] 获取配置出错！');
      throw error;
    }
  }

  getServerAddress() {
    let {
      SERVER_HOST: host = '127.0.0.0',
      SERVER_PORT: port = this.config.koa.port,
    } = this.remoteConfig;

    if (!host.startsWith('http://') && !host.startsWith('https://')) {
      host = `http://${host}`;
    }

    return `${host}:${port}`;
  }

  async register() {
    const success = await this.consul.agent.check
      .register({
        name: this.getConsulKey(),
        timeout: '10s',
        http: `${this.getServerAddress()}/status.ok`,
        interval: '10s',
      })
      .catch(err => {
        console.error('注册服务失败: ', err);
        return false;
      })
      .then(() => true);
    this.logger.info(`[Consul] 服务注册${success ? '成功' : '失败'}!`);
  }

  async buildMidwayConfig() {
    await this.getRemoteConfig();
    return {
      // use for cookie sign key, should change to your own and keep security
      keys: this.remoteConfig?.APP_KEYS || v4(),
      koa: {
        port: EnvUtil.isTest ? null : (this.remoteConfig?.SERVER_PORT || 9527),
      },
      i18n: {
        defaultLocale: 'zh_CN',
      },
      validate: {
        validationOptions: {
          stripUnknown: true,
        },
      },
      rabbitmq: {
        url: this.remoteConfig?.MQ_HOST || 'amqp://localhost',
      },
      jwt: {
        secret: this.remoteConfig.JWT_SECRET ?? v4(), // fs.readFileSync('xxxxx.key')
        sign: {
          // signOptions
          expiresIn: '7d', // https://github.com/vercel/ms
          noTimestamp: true,
        },
      },
      swagger: {
        title: `${this.projectName}`,
      },
      sequelize: {
        dataSource: {
          // 第一个数据源，数据源的名字可以完全自定义
          default: {
            database: this.remoteConfig?.DB_DATABASE,
            username: this.remoteConfig?.DB_USERNAME,
            port: Number(this.remoteConfig?.DB_PORT),
            password: this.remoteConfig?.DB_PASSWORD,
            host: this.remoteConfig?.DB_HOST,
            dialect: this.remoteConfig?.DB_DIALECT,
            define: {
              underscored: false,
              paranoid: true,
              timestamps: true,
              charset: 'utf8',
            },
            pool: {
              idle: 30000,
            },
            omitNull: false,
            logging: false,
            timezone: '+08:00',
            encrypt: false,
            sync: EnvUtil.isLocal || EnvUtil.isDev,
            syncOptions: {
              alter: true,
              force: false,
            },
            models: Object.values(models),
          },
        },
      } as SequelizeConfigOptions,
      redis: {
        client: {
          port: this.remoteConfig?.REDIS_PORT || 6379, // Redis port
          host: this.remoteConfig?.REDIS_HOST || '127.0.0.1', // Redis host
        },
      },
    } //as MidwayConfig;
  }

  @Destroy()
  async destroy() {
    console.log('ConsulService destroy');
  }
}
