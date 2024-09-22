import { Middleware, IMiddleware, Context } from '@midwayjs/core';
import { NextFunction,  } from '@midwayjs/koa';

@Middleware()
export class ResponseMiddleware implements IMiddleware<Context, NextFunction> {
  
  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      const result = await next();

      if (ctx.state.rawBody) {
        return result;
      }
    
      return {
        data: result,
        success: true,
        code: '0',
        message: '',
      };
    };
  }

  static getName(): string {
    return 'responseMiddleware';
  }
}
