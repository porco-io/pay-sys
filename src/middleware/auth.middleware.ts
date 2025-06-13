import { Middleware, IMiddleware, httpError, Inject } from '@midwayjs/core';
import { NextFunction, Context } from '@midwayjs/koa';
import { models } from '../models/models';
import { JwtService } from '@midwayjs/jwt';
import {JwtKeyid } from '../define/enums';

@Middleware()
export class AuthMiddleware implements IMiddleware<Context, NextFunction> {
  @Inject()
  jwtService: JwtService;

  /** 白名单 */
  whiteList = ['/api/auth', '/status.ok'];

  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      if (ctx.headers['authorization']) {
        const authorization = ctx.headers['authorization'];
        if (!authorization) return;
        const parts = authorization.trim().split(' ');
        if (parts.length === 2) {
          const [scheme, token] = parts;
          if (/^Bearer$/i.test(scheme)) {
            try {
              const payload = this.jwtService.decodeSync(token) as IStruct.UserCache;
              if (payload.jti === JwtKeyid.user) {
                ctx.state.user = await this.authUser(token)
              }
            } catch(err) {
              if (err.name !== 'TokenExpiredError') {
                console.error(err)
              }
            }
          }
        }
      }

      return next();
    };
  }

  async authUser(token: string) {
    const decoded = await this.jwtService.verify(token, {
      complete: true,
      jwtid: JwtKeyid.user,
    });
    if (typeof decoded !== 'string') {
      const payload = decoded.payload as IStruct.UserCache;
      const curUser = await (async () => {
        try {
          return await models.AdminUser.findByPk(payload.id);
        } catch {
          return null;
        }
      })();
      if (curUser) {
        return curUser;
      }
    }
  }


  static getName(): string {
    return 'authMiddleware';
  }

  // 配置忽略鉴权的路由地址
  public match(ctx: Context): boolean {
    const ignore = this.whiteList.some(
      pattern => ctx.path.indexOf(pattern) !== -1
    );
    return !ignore;
  }
}

@Middleware()
export class LoginRequired implements IMiddleware<Context, NextFunction> {
  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      if (!ctx.state.user) {
        throw new httpError.UnauthorizedError('请登录');
      }
      return next();
    };
  }

  static getName(): string {
    return 'loginRequired';
  }
}



@Middleware()
export class InternalRequired implements IMiddleware<Context, NextFunction> {
  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      if (!ctx.state.application) {
        throw new httpError.UnauthorizedError('仅允许内部调用');
      }
      return next();
    };
  }

  static getName(): string {
    return 'InternalRequired';
  }
}
