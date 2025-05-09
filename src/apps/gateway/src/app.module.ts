import { Module } from '@nestjs/common';

import { EnvironmentModule } from './modules/common/environment/environment.module';
import { GatewayModule } from './modules/gateway/gateway.module';

@Module({
  imports: [EnvironmentModule, GatewayModule],
})
export class AppModule {}
