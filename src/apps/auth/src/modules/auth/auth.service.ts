import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { compare, hash } from 'bcrypt';
import { Model } from 'mongoose';
import ms from 'ms';

import { TokenType } from '../../common/enums/token-type.enum';
import { ConflictError } from '../../common/errors/conflict.error';
import { NotFoundError } from '../../common/errors/not-found.error';
import { UnauthorizedError } from '../../common/errors/unauthorized.error';
import { UserTokenResponse } from '../../common/interfaces/token-response.interface';
import { UserLoginPayload, UserRegisterPayload } from '../../validations/auth.validation';
import { EnvironmentService } from '../common/environment/environment.service';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class AuthService {
  private readonly accessTokenSecret: string;
  private readonly accessTokenExpiry: string;
  private readonly accessTokenExpiryMs: number;

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly envService: EnvironmentService,
    private readonly jwtService: JwtService,
  ) {
    this.accessTokenSecret = this.envService.get('JWT_ACCESS_TOKEN_SECRET');
    this.accessTokenExpiry = this.envService.get('JWT_ACCESS_EXPIRES_IN');
    this.accessTokenExpiryMs = ms(this.accessTokenExpiry as ms.StringValue);
  }

  async register(payload: UserRegisterPayload): Promise<void> {
    const existingUser = await this.userModel.findOne({
      $or: [{ email: payload.email }, { username: payload.username }],
    });

    if (existingUser) {
      if (existingUser.email === payload.email) {
        throw new ConflictError({ message: 'Email already exists' });
      }
      if (existingUser.username === payload.username) {
        throw new ConflictError({ message: 'Username already exists' });
      }
    }

    const hashedPassword = await hash(payload.password, 12);

    const newUser = new this.userModel({
      email: payload.email,
      username: payload.username,
      password: hashedPassword,
    });

    await newUser.save();
  }

  async login(payload: UserLoginPayload): Promise<UserTokenResponse> {
    try {
      const user = await this.userModel.findOne({ email: payload.email });

      if (!user) {
        throw new NotFoundError({ message: 'User not found' });
      }

      const isPasswordMatch = await compare(payload.password, user.password);

      if (!isPasswordMatch) throw new UnauthorizedError({ message: 'Invalid email or password' });

      const access_token = this.jwtService.sign(
        { sub: (user._id as any).toString(), email: user.email, username: user.username },
        { secret: this.accessTokenSecret, expiresIn: this.accessTokenExpiry },
      );

      return {
        access_token,
        token_type: TokenType.Bearer,
        expires_in: this.accessTokenExpiryMs,
      };
    } catch (error) {
      if (error instanceof NotFoundError) throw new UnauthorizedError({ message: 'Invalid email or password' });

      throw error;
    }
  }
}
