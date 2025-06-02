import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cors from 'cors';
import helmet from 'helmet';

import { AppModule } from './app/app.module';
import { LoggerInterceptor } from './common/interceptors';
import { clientMetaMiddleware, methodFilterMiddleware, reqMetaMiddleware } from './common/middlewares';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // Security middlewares
  app.use(helmet());
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
      credentials: true,
    }),
  );

  // Custom middlewares (order matters)
  app.use(methodFilterMiddleware);
  app.use(clientMetaMiddleware);
  app.use(reqMetaMiddleware);

  // Global interceptors
  app.useGlobalInterceptors(new LoggerInterceptor());

  // Start server
  const port = process.env.PORT || 3000;
  await app.listen(port);

  Logger.log(`🚀 Gateway is running on: http://localhost:${port}/${globalPrefix}`, 'Bootstrap');
  Logger.log(`📊 Health check available at: http://localhost:${port}/${globalPrefix}/health`, 'Bootstrap');
}

bootstrap().catch((error) => {
  Logger.error('Failed to start gateway:', error);
  process.exit(1);
});
