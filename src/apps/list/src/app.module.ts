import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { EnvironmentModule } from './modules/common/environment/environment.module';
import { EnvironmentService } from './modules/common/environment/environment.service';
import { LoggerModule } from './modules/common/logger/logger.module';
import { RedisModule } from './modules/common/redis/redis.module';
import { ListModule } from './modules/list/list.module';

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
    ListModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
