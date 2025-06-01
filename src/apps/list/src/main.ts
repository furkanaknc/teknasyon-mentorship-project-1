import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';

import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { EnvironmentService } from './modules/common/environment/environment.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
    bufferLogs: true,
  });

  const logger = app.get(Logger);
  app.useLogger(logger);

  app.useGlobalFilters(new AllExceptionsFilter(logger));

  const envService = app.get(EnvironmentService);
  const port = envService.get('LIST_PORT');

  await app.listen(port);

  logger.log(`List service is running on port ${port}`);
}

void bootstrap();
