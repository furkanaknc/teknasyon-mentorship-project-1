import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtGuard, SharedAuthModule } from '@teknasyon/shared-auth';

import { AppController } from './app.controller';
import { EnvironmentModule } from './modules/common/environment/environment.module';
import { EnvironmentService } from './modules/common/environment/environment.service';
import { LoggerModule } from './modules/common/logger/logger.module';
import { RedisModule } from './modules/common/redis/redis.module';
import { ProfileModule } from './modules/profile/profile.module';

@Module({
  imports: [
    EnvironmentModule,
    LoggerModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SharedAuthModule.forRootAsync({
      imports: [EnvironmentModule],
      inject: [EnvironmentService],
      useFactory: (envService: EnvironmentService) => ({
        jwtSecret: envService.get('JWT_ACCESS_SECRET'),
        authServiceUrl: envService.get('AUTH_SERVICE_URL'),
      }),
    }),
    RedisModule,
    MongooseModule.forRootAsync({
      imports: [EnvironmentModule],
      inject: [EnvironmentService],
      useFactory: (envService: EnvironmentService) => ({
        uri: envService.get('DATABASE_URL'),
      }),
    }),
    ProfileModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
  ],
})
export class AppModule {}
