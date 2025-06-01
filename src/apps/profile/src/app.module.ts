import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

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
  providers: [],
})
export class AppModule {}
