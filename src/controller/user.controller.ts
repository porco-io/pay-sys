import { Inject, Controller, Get, Query, Post, Body } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { UserService } from '../service/user.service';
import { SigninDTO, SignupDTO } from '../dto/auth.dto';

@Controller('/api/users')
export class UserController {
  @Inject()
  ctx: Context;

  @Inject()
  userService: UserService;

  // 管理用户
  @Get('/me', {
    description: '获取当前用户信息'
  })
  async me() {
    return this.ctx.state.user;
  }

 
}
