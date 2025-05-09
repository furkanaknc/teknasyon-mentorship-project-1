import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { EnvironmentModule } from './modules/common/environment/environment.module';
import { EnvironmentService } from './modules/common/environment/environment.service';
import { RedisModule } from './modules/common/redis/redis.module';

@Module({
  imports: [
    EnvironmentModule,
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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
