import { Options } from "amqplib";

export enum EXCHANGE_TYPE {
  DIRECT = 'direct',
  FANOUT = 'fanout',
  TOPIC = 'topic',
  HEADERS = 'headers',
}

export enum Exchanges {
  /** 动态更新 */
  post = 'post_ex',
  /** 用户交易 */
  trade = 'trade_ex',
}

export enum Queues {
  post = 'post',
  trade = 'trade',
}


export const getQueueByTemplate = (queue: Queues, params: Record<string, any>): string => {
  return queue.replace(/\$\{(\w+)\}/g, (match, key) => params[key]);
}

export const queueOptions: Record<string, Options.AssertQueue> = {
  [Exchanges.post]: {
    durable: false,
    
  },
  [Exchanges.trade]: {
    durable: true,
  }
};

export const exchangeOptions: Record<string, {
  type: EXCHANGE_TYPE,
  option: Options.AssertExchange
}> = {
  [Queues.post]: {
    option: {
      durable: true,
    },
    type: EXCHANGE_TYPE.DIRECT,
  },
  [Queues.trade]: {
    option: {
      durable: true,
    },
    type: EXCHANGE_TYPE.DIRECT,
  }
};