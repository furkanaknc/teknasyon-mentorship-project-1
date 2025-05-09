import { All, Body, Controller, Headers, Req } from '@nestjs/common';
import { Request } from 'express';

import { AuthProxyService } from '../services/auth-proxy.service';
import { ListProxyService } from '../services/list-proxy.service';
import { ProfileProxyService } from '../services/profile-proxy.service';

@Controller()
export class GatewayController {
  constructor(
    private readonly authProxyService: AuthProxyService,
    private readonly listProxyService: ListProxyService,
    private readonly profileProxyService: ProfileProxyService,
  ) {}

  @All('auth/*')
  async handleAuthRequests(@Req() req: Request, @Body() body: any, @Headers() headers: any) {
    const path = req.url.replace('/auth', '');
    return this.authProxyService.forwardRequest(req.method, path, body, headers);
  }

  @All('lists/*')
  async handleListRequests(@Req() req: Request, @Body() body: any, @Headers() headers: any) {
    const path = req.url.replace('/lists', '');
    return this.listProxyService.forwardRequest(req.method, path, body, headers);
  }

  @All('profiles/*')
  async handleProfileRequests(@Req() req: Request, @Body() body: any, @Headers() headers: any) {
    const path = req.url.replace('/profiles', '');
    return this.profileProxyService.forwardRequest(req.method, path, body, headers);
  }
}
