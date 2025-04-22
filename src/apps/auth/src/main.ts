import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { EnvironmentService } from './modules/common/environment/environment.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });

  const envService = app.get(EnvironmentService);

  await app.listen(envService.get('AUTH_PORT'));
}

void bootstrap();
