import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { EnvironmentModule } from './modules/common/environment/environment.module';
import { EnvironmentService } from './modules/common/environment/environment.service';
import { ListModule } from './modules/list/list.module';

@Module({
  imports: [
    EnvironmentModule,
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
