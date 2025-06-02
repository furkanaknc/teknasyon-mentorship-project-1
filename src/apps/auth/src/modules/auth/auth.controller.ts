import { Body, Controller, Get, Post, Req } from '@nestjs/common';

import { Public } from '../../common/decorators/public.decorator';
import { UnauthorizedError } from '../../common/errors/unauthorized.error';
import { IRequest } from '../../common/interfaces/requests.interface';
import { UserTokenResponse } from '../../common/interfaces/token-response.interface';
import { UserLoginPayload, UserRegisterPayload } from '../../validations/auth.validation';
import { AuthService } from './auth.service';
import { VerificationService } from './verification.service';

@Public()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly verificationService: VerificationService,
  ) {}

  @Post('register')
  async register(@Body() payload: UserRegisterPayload): Promise<void> {
    await this.authService.register(payload);
  }

  @Post('login')
  async login(@Body() payload: UserLoginPayload): Promise<UserTokenResponse> {
    return await this.authService.login(payload);
  }

  @Get('verify')
  async verifyToken(@Req() request: IRequest) {
    // This endpoint is called by other services to verify tokens
    // The JWT guard already verified the token and populated request.user
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedError({ message: 'No token provided' });
    }

    // Get full user details from verification service
    const user = await this.verificationService.verifyUser(token);
    return user;
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
