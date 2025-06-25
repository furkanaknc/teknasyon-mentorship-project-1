import { Controller, Get } from '@nestjs/common';
import { Public } from '@teknasyon/shared-auth';

@Controller()
export class AppController {
  @Get('/health')
  @Public()
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'profile',
    };
  }
}
