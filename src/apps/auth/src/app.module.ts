import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller';
import { JwtGuard } from './common/guards/jwt.guard';
import { AuthModule } from './modules/auth/auth.module';
import { EnvironmentModule } from './modules/common/environment/environment.module';
import { EnvironmentService } from './modules/common/environment/environment.service';
import { LoggerModule } from './modules/common/logger/logger.module';
import { RedisModule } from './modules/common/redis/redis.module';

@Module({
  imports: [
    EnvironmentModule,
    LoggerModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RedisModule,
    MongooseModule.forRootAsync({
      imports: [EnvironmentModule],
      inject: [EnvironmentService],
      useFactory: (envService: EnvironmentService) => ({
        uri: envService.get('DATABASE_URL'),
      }),
    }),
    AuthModule,
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
