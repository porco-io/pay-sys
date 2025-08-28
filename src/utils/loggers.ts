import log4js, { Logger } from 'log4js';
import path from 'path';

/** 日志类型 */
export enum LOGGER_TYPES {
  default = 'default',
  mq = 'mq',
}
export type AppLoggers = Record<LOGGER_TYPES, Logger>;

export const logLevels = log4js.levels;

export let loggers: AppLoggers

export let log: Logger;

interface LoggerConfig {
  logDir: string;
  level: string;
}
export function initLogger({
  logDir,
  level = 'debug'
}: LoggerConfig): {
  loggers: AppLoggers,
  shutdown: () => void
} {
  log4js.configure({
    appenders: {
      accessDateFile: {
        type: 'dateFile',
        filename: path.join(logDir, 'access.log'),
        pattern: 'yyyy-MM-dd',
        alwaysIncludePattern: true,
        encoding: 'utf-8',
        keepFileExt: true,
        // daysToKeep: 20,
        numBackups: 20,
      },
      mqDateFile: {
        type: 'dateFile',
        filename: path.join(logDir, 'mq.log'),
        pattern: 'yyyy-MM-dd',
        alwaysIncludePattern: true,
        encoding: 'utf-8',
        keepFileExt: true,
        // daysToKeep: 20,
        numBackups: 20,
      },
      console: {
        type: 'console',
        layout: {
          type: 'colored'
        }
      }
    },
    categories: {
      [LOGGER_TYPES.default]: {
        appenders: ['console', 'accessDateFile'],
        level: level
      },
      [LOGGER_TYPES.mq]: {
        appenders: ['console', 'mqDateFile'],
        level: log4js.levels.ALL.levelStr,
      },
    },
    pm2: true
  });

  loggers = Object.values(LOGGER_TYPES) 
    .reduce((state, name) => {
      const l = log4js.getLogger(name);
      if (l) {
        state[name] = l;
      }
      return state;
    }, {} as AppLoggers);
  log = loggers.default;
  return {
    loggers,
    shutdown: () => {
      log4js.shutdown();
    }
  };
}