import {
  Provide,
  Scope,
  ScopeEnum,
  Init,
  Autoload,
  Destroy,
  Inject,
  Logger,
  Singleton,
} from '@midwayjs/core';
import {
  AmqpConnectionManager,
  Channel,
  ChannelWrapper,
  SetupFunc,
  connect,
} from 'amqp-connection-manager';
import { EXCHANGE_TYPE, Exchanges, Queues, exchangeOptions, queueOptions } from '../define/mq';
import { ILogger } from '@midwayjs/logger';

@Autoload()
@Provide()
@Singleton() // Singleton 单例，全局唯一（进程级别）
export class RabbitmqService {
  // 连接
  private connection: AmqpConnectionManager;
  // 通道
  private channel: ChannelWrapper;
  // 是否已销毁
  private isDestroyed: boolean = false;
  // 已声明的队列
  private assetedQueues = new Set<string>();
  // 已声明的交换机
  private assetedExchanges = new Set<string>();

  @Logger('mqLogger')
  logger: ILogger;

  @Init()
  async connect() {
    if (process.env.NODE_ENV === 'test') return;
    // 创建连接，你可以把配置放在 Config 中，然后注入进来
    if (!this.connection) {
      this.connection = connect({
        hostname: process.env.MQ_HOST,
        vhost: process.env.MQ_VHOST,
        username: process.env.MQ_USERNAME,
        password: process.env.MQ_PASSWORD,
      });
      this.connection.on('disconnect', () => {
        if (!this.isDestroyed) {
          setTimeout(() => {
            this.connect();
          }, 1000);
        }
      });
    }
    if (!this.connection.isConnected()) {
      await this.connection.connect({ timeout: 5000 });
      this.logger.info('Rabbitmq connected');
    }

    // 创建 channel
    if (!this.channel) {
      this.channel = this.connection.createChannel({
        json: true,
        setup: ((channel: Channel, cb) => {
          return Promise.all([
            // 绑定队列
            // Queues.post
            this.assertQueue(Queues.post),
            this.assertQueue(Queues.trade),
            // 绑定交换机
            this.assertExchange(Exchanges.post),
            this.assertExchange(Exchanges.trade),
          ]);
        }) as SetupFunc,
        confirm: false,
        name: 'hipo-server',
      });
    }
    await this.channel.waitForConnect(() => {});
    this.logger.info(`Channel[${this.channel.name}] connected.`);
  }
  /// 发布
  public async publish(
    content: any,
    exchangeName: string,
    routingKey: string = ''
  ) {
    // 声明交换机
    await this.assertExchange(exchangeName);
    try {
      return this.channel.publish(exchangeName, routingKey, content);
    } catch (error) {
      await this.assertExchange(exchangeName, false);
      return this.channel.publish(exchangeName, routingKey, content);
    }
  }

  // 发送到队列
  public async sendToQueue(queueName: string, data: any) {
    // 声明队列
    await this.assertQueue(queueName);
    try {
      return this.channel.sendToQueue(queueName, data);
    } catch (error) {
      await this.assertQueue(queueName, false);
      return this.channel.sendToQueue(queueName, data);
    }
  }

  @Destroy()
  async close() {
    this.isDestroyed = true;
    await this.channel?.close();
    await this.connection?.close();
  }

  async assertExchange(exchangeName: string, cache = true) {
    if (cache && this.assetedExchanges.has(exchangeName)) {
      return;
    }
    const { type = EXCHANGE_TYPE.DIRECT, option = {} } =
      exchangeOptions[exchangeName] ?? {};
    await this.channel.assertExchange(exchangeName, type, {
      durable: true,
      ...option,
    });
    this.assetedExchanges.add(exchangeName);
  }

  async assertQueue(queueName: string, cache = true) {
    if (cache && this.assetedQueues.has(queueName)) {
      return;
    }

    const option = queueOptions[queueName] ?? {};
    await this.channel.assertQueue(queueName, { durable: true, ...option });
    this.assetedQueues.add(queueName);
  }
}
