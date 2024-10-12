import { Inject, Controller, Get, Query, Post, Body } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { UserService } from '../service/user.service';
import { SigninDTO, SignupDTO } from '../dto/auth.dto';
import { LoginRequired } from '../middleware/auth.middleware';

@Controller('/api/users')
export class UserController {
  @Inject()
  ctx: Context;

  @Inject()
  userService: UserService;

  @Get('/me', {
    description: '获取当前用户信息',
    middleware: [LoginRequired]
  })
  async me() {
    return this.ctx.state.user;
  }
 
}
