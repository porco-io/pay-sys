import { IMiddleware, Middleware, NextFunction } from "@midwayjs/core";
import { Context } from "@midwayjs/koa";

@Middleware()
export class ErrorMiddleware implements IMiddleware<Context, NextFunction> {
  
  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      try {
        return await next();
      } catch (err) {
        // 去除js的栈信息
        err.stack = err.stack.split('\n').filter((line: string) => !line.match(/\.js(:[0-9]+)\b/)).join('\n');
        ctx.logger.error(err);
        ctx.status = err.status || 500;
        if (ctx.status === 500) {
          return 'Server Internal Error'
        }
        return {
          success: false,
          data: null,
          message: err.message,
          code: err.code?.toString() || '400'
        };
      }
      
    };
  }

 

  static getName(): string {
    return 'errorMiddleware';
  }
}