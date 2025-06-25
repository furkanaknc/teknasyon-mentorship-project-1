import { Controller, Get } from '@nestjs/common';

import { Public } from './common/decorators/public.decorator';

@Controller()
export class AppController {
  @Get('/health')
  @Public()
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'auth',
    };
  }
}
