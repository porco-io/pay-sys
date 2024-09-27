import { Inject, Controller, Get, httpError, Queries} from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { LoginRequired } from '../middleware/auth.middleware';
import { UploadDTO } from '../dto/tool.dto';
import { UPLOAD_TYPE, UploadOssHelper, UploadParams } from '../utils/alicloud';

@Controller('/api/tool')
export class PaymentController {
  @Inject()
  ctx: Context;

  /** 获取上传文件凭据 */
  @Get('/upload/access', {
    description: '获取上传文件凭据',
    middleware: [
      LoginRequired
    ]
  })
  async getUploadAccess(@Queries() params: UploadDTO) {
   
    let accessInfo: UploadParams;
    try {
      accessInfo = new UploadOssHelper({
        filename: params.filename,
        callbackUrl: `${process.env.OSS_CALLBACK_HOST}/open/tools/upload/callback`,
        callbackParams:{
          filename:  params.filename,
          owner: `a-${this.ctx.state.user.id.toString().padStart(5, '0')}`,
          uploadType: params.uploadType || UPLOAD_TYPE.pay
        },
        uploadType: params.uploadType,
        ownerAccount: this.ctx.state.user.username,
      }).createUploadParams();
    } catch(err) {
      throw new httpError.BadRequestError(err.message);
    }
 
    return accessInfo;
  }
}
