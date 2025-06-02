import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtVerificationService } from "../services/jwt-verification.service";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import { UnauthorizedError } from "../errors/unauthorized.error";
import { IRequest } from "../interfaces/requests.interface";

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtVerificationService: JwtVerificationService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<IRequest>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedError({ message: "No token provided" });
    }

    // For shared library, we only verify the JWT token
    // Each app can decide how to handle user data
    const payload = await this.jwtVerificationService.verifyToken(token);

    // Store minimal user info in request
    request.user = {
      id: payload.sub, // You might want to extract actual user ID differently
    };

    return true;
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }
}
