
declare namespace NodeJS {
  interface ProcessEnv {
    /** 数据库 */
    DB_DATABASE: string;
    DB_USERNAME: string;
    DB_PORT: string;
    DB_PASSWORD: string;
    DB_HOST: string;
    DB_DIALECT: import('sequelize').Dialect;
    REDIS_HOST: string;
    REDIS_PORT: string;
    /** 服务启动端口 */
    SERVER_PORT: string;
    SERVER_HOST: string;
    MQ_HOST: string;
    MQ_VHOST: string;
    MQ_USERNAME: string;
    MQ_PASSWORD: string;
    NODE_ENV: 'production' | 'development' | 'local' | 'test' | 'unittest' | 'dev'
    // admin配置
    ADMIN_USERNAME: string;
    ADMIN_PASSWORD: string;
    // oss配置
    OSS_ACCESS_KEY_ID: string;
    OSS_ACCESS_KEY_SECRET: string;
    OSS_ENDPOINT: string;
    OSS_CALLBACK_HOST: string;
    [key: string]: string | undefined;
  }
}

type ValueOf<T> = T[keyof T];