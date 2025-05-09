import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { EnvironmentModule } from '../common/environment/environment.module';
import { GatewayController } from './controllers/gateway.controller';
import { AuthProxyService } from './services/auth-proxy.service';
import { ListProxyService } from './services/list-proxy.service';
import { ProfileProxyService } from './services/profile-proxy.service';

@Module({
  imports: [
    EnvironmentModule,
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  controllers: [GatewayController],
  providers: [AuthProxyService, ListProxyService, ProfileProxyService],
})
export class GatewayModule {}
