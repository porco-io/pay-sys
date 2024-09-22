import { Inject, Provide, httpError } from '@midwayjs/core';
import { models } from '../models/models';
import { SigninDTO, SignupDTO } from '../dto/auth.dto';
import { generatePassword, genSalt, validatePassword } from '../utils/helper';
import { omit } from 'lodash';
import { JwtService } from '@midwayjs/jwt';
import { UserStatus, JwtKeyid } from '../define/enums';

@Provide()
export class UserService {

  @Inject()
  jwtService: JwtService;

  /** 注册 */
  async signup(params: SignupDTO) {
    const {
      username,
      password,
    } = params;
    const salt = genSalt();
    const dbPassword = generatePassword(password, salt);

    const [newUser, created] = await models.User.findOrCreate({
      where: {
        username,
      },
      defaults: {
        salt,
        password: dbPassword,
        status: UserStatus.NORMAL
      }
    });

    if (!created) {
      throw new httpError.ConflictError('用户已存在')
    }

    return newUser;
  }

  /** 登录 */
  async signin(params: SigninDTO) {
    const {
      username,
      password,
    } = params;
    console.log(username, password)
    const userInfo = await models.User.findOne({
      where: {
        username,
      },
      attributes: {
        include: ['salt', 'password']
      }
    });

    if (!userInfo) {
      throw new httpError.UnauthorizedError('用户不存在')
    }
    if (!validatePassword(password, userInfo.salt, userInfo.password)) {
      throw new httpError.UnauthorizedError('密码错误')
    }
    const userCacheObj = {
      username: userInfo.username,
      id: userInfo.id,
    }
    const token = await this.jwtService.sign(userCacheObj, {
      jwtid: JwtKeyid.user,
      noTimestamp: true,
    });
    console.log(this.jwtService.decodeSync(token))
    return {
      ...omit(userInfo.toJSON(), ['salt', 'password']),
      token
    };
  }
}
