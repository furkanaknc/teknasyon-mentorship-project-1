import { Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';

import { EnvironmentService } from '../environment/environment.service';

@Module({
  imports: [
    PinoLoggerModule.forRootAsync({
      inject: [EnvironmentService],
      useFactory: (envService: EnvironmentService) => ({
        pinoHttp: {
          level: envService.get('LOG_LEVEL') || 'info',
        },
      }),
    }),
  ],
  exports: [PinoLoggerModule],
})
export class LoggerModule {}
