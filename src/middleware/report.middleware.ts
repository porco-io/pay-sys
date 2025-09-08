import { Middleware, IMiddleware } from '@midwayjs/core';
import { NextFunction, Context } from '@midwayjs/koa';
import { pick } from 'lodash';
import colors from 'ansi-colors';

@Middleware()
export class ReportMiddleware implements IMiddleware<Context, NextFunction> {
  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      // 控制器前执行的逻辑
      const startTime = Date.now();
      // 执行下一个 Web 中间件，最后执行到控制器
      // 这里可以拿到下一个中间件或者控制器的返回值
      const headerInfo = pick(ctx.headers, ['authorization', 'user-agent']);
      const result = await next();

      console.info(
        `[${this.getStatusCode(ctx.status)}] ${
          Date.now() - startTime
        }ms - query: ${JSON.stringify(
          ctx.querystring ?? null
        )} - body: ${JSON.stringify(
          ctx.request.body ?? null
        )} - header: ${JSON.stringify(headerInfo)}}`
      );

      return result;
    };
  }

  getStatusCode(code: number) {
    const codeStr = code.toString();
    if (code >= 200 && code < 300) {
      return colors.green(codeStr);
    } else if (code >= 300 && code < 400) {
      return colors.yellow(codeStr);
    } else if (code >= 400 && code < 500) {
      return colors.red(codeStr);
    } else {
      return colors.redBright(codeStr);
    }
  }

  static getName(): string {
    return 'reportMiddleware';
  }
}
