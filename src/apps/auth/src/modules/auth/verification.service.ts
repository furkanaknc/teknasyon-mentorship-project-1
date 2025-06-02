import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { UnauthorizedError } from '../../common/errors/unauthorized.error';
import { EnvironmentService } from '../common/environment/environment.service';
import { JwtPayload, VerifiedUser } from './interfaces/model.interface';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class VerificationService {
  private readonly accessTokenSecret: string;

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly envService: EnvironmentService,
    private readonly jwtService: JwtService,
  ) {
    this.accessTokenSecret = this.envService.get('JWT_ACCESS_TOKEN_SECRET');
  }

  async verifyUser(token: string): Promise<VerifiedUser> {
    try {
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: this.accessTokenSecret,
      });

      const user = await this.userModel.findById(payload.sub).select('_id email username');

      if (!user) {
        throw new UnauthorizedError({ message: 'User not found' });
      }

      return {
        id: (user._id as any).toString(),
        email: user.email,
        username: user.username,
      };
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }

      throw new UnauthorizedError({ message: 'Invalid or expired token' });
    }
  }
}
