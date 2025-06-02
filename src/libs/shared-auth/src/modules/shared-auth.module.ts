import { Module, DynamicModule } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { JwtGuard } from "../guards/jwt.guard";
import {
  JwtVerificationService,
  AuthConfig,
} from "../services/jwt-verification.service";

export interface AuthConfigFactory {
  createAuthConfig(): Promise<AuthConfig> | AuthConfig;
}

export interface AuthAsyncOptions {
  imports?: any[];
  inject?: any[];
  useFactory: (...args: any[]) => Promise<AuthConfig> | AuthConfig;
}

@Module({})
export class SharedAuthModule {
  static forRoot(config: AuthConfig): DynamicModule {
    return {
      module: SharedAuthModule,
      imports: [
        JwtModule.register({
          secret: config.jwtSecret,
        }),
      ],
      providers: [
        {
          provide: "AUTH_CONFIG",
          useValue: config,
        },
        JwtVerificationService,
        JwtGuard,
      ],
      exports: [JwtGuard, JwtVerificationService],
      global: true,
    };
  }

  static forRootAsync(options: AuthAsyncOptions): DynamicModule {
    return {
      module: SharedAuthModule,
      imports: [
        ...(options.imports || []),
        JwtModule.registerAsync({
          imports: options.imports,
          inject: options.inject,
          useFactory: async (...args: any[]) => {
            const config = await options.useFactory(...args);
            return {
              secret: config.jwtSecret,
            };
          },
        }),
      ],
      providers: [
        {
          provide: "AUTH_CONFIG",
          useFactory: options.useFactory,
          inject: options.inject,
        },
        JwtVerificationService,
        JwtGuard,
      ],
      exports: [JwtGuard, JwtVerificationService],
      global: true,
    };
  }
}
