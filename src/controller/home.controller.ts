import { Controller, Get, Inject } from '@midwayjs/core';
import { Context } from '@midwayjs/core';

@Controller('/')
export class HomeController {
  @Inject()
  ctx: Context;

  @Get('/')
  async home(): Promise<string> {
    return 'Hipo pay service';
  }

  @Get('/status.ok')
  async statusOK(): Promise<string> {
    this.ctx.state.rawBody = true;
    return 'ok';
  }
}
