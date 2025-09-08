import { MidwayConfig } from "@midwayjs/core";
import { LoggerInfo, LoggerOptions } from "@midwayjs/logger";
import { createRedisStore } from "@midwayjs/cache-manager";

const logFormat = (name: string) => (info: LoggerInfo) => {
  return `${info.timestamp} ${info.LEVEL} [midway:${name}] ${info.message}`;
};

export default () => {
  return {
    // use for cookie sign key, should change to your own and keep security
    keys: "1726669907781_3034",
    jwt: {
      secret: "0fec3b24-04db-466f-a518-eae6c1d3f451", // fs.readFileSync('xxxxx.key')
      sign: {
        // signOptions
        expiresIn: "7d", // https://github.com/vercel/ms
        noTimestamp: true,
      },
    },
    koa: {
      port: Number(process.env.SERVER_PORT),
    },
    i18n: {
      defaultLocale: "zh_CN",
    },
    validate: {
      validationOptions: {
        stripUnknown: true,
      },
    },
    cacheManager: {
      clients: {
        memory: {
          store: "memory",
          options: {
            max: 300,
            ttl: 3000,
          },
        },
        redis: {
          store: createRedisStore("default"),
        },
      },
    },
    midwayLogger: {
      clients: {
        //  coreLogger: {
        //     level: "info",
        //   },
        //   appLogger: {
        //     level: "debug",
        //   },
        //   mqLogger: {
        //     level: "debug",
        //   },
        coreLogger: {
          format: logFormat("core"),
          level: "info",
        },
        appLogger: {
          format: logFormat("app"),
          level: "debug",
        },
        mqLogger: {
          level: "info",
          aliasName: "mqLogger",
          format: logFormat("mq"),
          transports: {
            console: {
              level: "info",
            },
            file: {
              fileLogName: "mq.log",
              level: "info",
            },
          },
        },
      },
      // } as Record<string, LoggerOptions> ,
      default: {},
    },
    redis: {
      client: {
        port: 6379, // Redis port
        host: "127.0.0.1", // Redis host
      },
    },
    rabbitmq: {
      url: process.env.MQ_HOST || "amqp://localhost",
    },
    sequelize: {
      dataSource: {
        // 第一个数据源，数据源的名字可以完全自定义
        default: {
          database: process.env.DB_DATABASE,
          username: process.env.DB_USERNAME,
          port: Number(process.env.DB_PORT),
          password: process.env.DB_PASSWORD,
          host: process.env.DB_HOST,
          dialect: process.env.DB_DIALECT,
          define: {
            underscored: false,
            paranoid: true,
            timestamps: true,
            charset: "utf8",
          },
          pool: {
            idle: 30000,
          },
          omitNull: false,
          logging: false,
          timezone: "+08:00",
          encrypt: false,
          sync: false,
          // models: Object.values(models),
          // 支持如下的扫描形式，为了兼容我们可以同时进行.js和.ts匹配️
          entities: [
            "models/models/*.model.{j,t}s", // 通配加后缀匹配
          ],
        },
      },
    },
  } as MidwayConfig;
};
