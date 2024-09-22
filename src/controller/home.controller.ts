import { Controller, Get } from '@midwayjs/core';

@Controller('/')
export class HomeController {
  @Get('/')
  async home(): Promise<string> {
    return 'Hipo pay service';
  }

  @Get('/status.ok')
  async statusOK(): Promise<string> {
    return 'ok';
  }
}
