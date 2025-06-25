import { HttpModule } from '@nestjs/axios';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { JwtGuard, SharedAuthModule } from '@teknasyon/shared-auth';

import { LoggerInterceptor } from '../common/interceptors';
import { clientMetaMiddleware, methodFilterMiddleware, reqMetaMiddleware } from '../common/middlewares';
import { AuthController, ListController, ListItemsController, ProfileController } from '../controllers';
import { gatewayEnvSchema } from '../validations/env.validation';
import { AppController } from './app.controller';
import { ProxyService } from './proxy.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      validate: (config) => gatewayEnvSchema.parse(config),
    }),
    HttpModule.register({
      timeout: parseInt(process.env.REQUEST_TIMEOUT) || 10000,
      maxRedirects: 3,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.RATE_LIMIT_TTL) || 60000,
        limit: parseInt(process.env.RATE_LIMIT_MAX) || 100,
      },
    ]),
    SharedAuthModule.forRoot({
      jwtSecret: process.env.JWT_SECRET || 'teknasyon-secret-key-2024',
    }),
  ],
  controllers: [AppController, AuthController, ListController, ListItemsController, ProfileController],
  providers: [
    ProxyService,
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggerInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(methodFilterMiddleware, clientMetaMiddleware, reqMetaMiddleware).forRoutes('*');
  }
}
