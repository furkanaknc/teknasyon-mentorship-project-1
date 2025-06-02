import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

import { EnvironmentService } from '../common/environment/environment.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User, UserSchema } from './schemas/user.schema';
import { VerificationService } from './verification.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.registerAsync({
      inject: [EnvironmentService],
      useFactory: (envService: EnvironmentService) => ({
        secret: envService.get('JWT_ACCESS_TOKEN_SECRET'),
        signOptions: {
          expiresIn: envService.get('JWT_ACCESS_EXPIRES_IN'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, VerificationService],
  exports: [AuthService, VerificationService],
})
export class AuthModule {}
