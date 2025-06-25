import { Body, Controller, Delete, Get, Logger, Put, Req, Res } from '@nestjs/common';
import { Public } from '@teknasyon/shared-auth';
import { Request, Response } from 'express';

import { ProxyService } from '../app/proxy.service';

@Controller('profile')
export class ProfileController {
  private readonly logger = new Logger(ProfileController.name);

  constructor(private readonly proxyService: ProxyService) {}

  @Get()
  async getProfile(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.proxyToService('profile', 'GET', '/profile', null, req, res);
  }

  @Put()
  async updateProfile(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    return this.proxyService.proxyToService('profile', 'PUT', '/profile', body, req, res);
  }

  @Delete()
  async deleteProfile(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.proxyToService('profile', 'DELETE', '/profile', null, req, res);
  }

  @Public()
  @Get('health')
  async health(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.proxyToService('profile', 'GET', '/health', null, req, res);
  }
}
