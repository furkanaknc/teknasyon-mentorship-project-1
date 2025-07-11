import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { Public } from '@teknasyon/shared-auth';
import { Request, Response } from 'express';

import { ProxyService } from '../app/proxy.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly proxyService: ProxyService) {}

  @Public()
  @Post('register')
  async register(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    return this.proxyService.proxyToService('auth', 'POST', '/auth/register', body, req, res);
  }

  @Public()
  @Post('login')
  async login(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    return this.proxyService.proxyToService('auth', 'POST', '/auth/login', body, req, res);
  }

  @Get('verify')
  async verify(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.proxyToService('auth', 'GET', '/auth/verify', null, req, res);
  }

  @Public()
  @Get('health')
  async health(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.proxyToService('auth', 'GET', '/health', null, req, res);
  }
}
