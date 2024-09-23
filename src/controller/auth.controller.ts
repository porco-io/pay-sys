import { Inject, Controller, Get, Query, Post, Body } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { UserService } from '../service/user.service';
import { SigninDTO, SignupDTO } from '../dto/auth.dto';

@Controller('/api/auth')
export class AuthController {
  @Inject()
  ctx: Context;

  @Inject()
  userService: UserService;

  // 管理用户
  @Post('/signup', {
    description: '管理用户注册'
  })
  async signup(@Body() params: SignupDTO) {
    const newUser = await this.userService.signup(params);
    newUser.setDataValue('password', undefined);
    newUser.setDataValue('salt', undefined);

    this.ctx.status = 201;
    return newUser;
  }

  @Post('/signin', {
    description: '用户登录'
  })
  @Post('/login', {
    description: '用户登录'
  })
  async signin(@Body() params: SigninDTO) {
    const result = await this.userService.signin(params);
    return result;
  }
}
