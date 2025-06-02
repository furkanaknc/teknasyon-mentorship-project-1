import { Injectable, Inject } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UnauthorizedError } from "../errors/unauthorized.error";

export interface JwtPayload {
  sub: string; // user ID
  email: string;
  username: string;
  iat?: number;
  exp?: number;
}

export interface VerifiedUser {
  id: string;
  email: string;
  username: string;
}

export interface AuthConfig {
  jwtSecret: string;
  authServiceUrl?: string; // For microservice calls
}

@Injectable()
export class JwtVerificationService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject("AUTH_CONFIG") private readonly authConfig: AuthConfig
  ) {}

  async verifyToken(token: string): Promise<JwtPayload> {
    try {
      return this.jwtService.verify<JwtPayload>(token, {
        secret: this.authConfig.jwtSecret,
      });
    } catch (error) {
      throw new UnauthorizedError({ message: "Invalid or expired token" });
    }
  }

  // For microservice architecture - call auth service to verify user
  async verifyUserRemote(token: string): Promise<VerifiedUser> {
    if (!this.authConfig.authServiceUrl) {
      throw new Error(
        "Auth service URL not configured for remote verification"
      );
    }

    try {
      // This would make HTTP call to auth service
      const response = await fetch(`${this.authConfig.authServiceUrl}/verify`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new UnauthorizedError({ message: "Invalid token" });
      }

      return (await response.json()) as VerifiedUser;
    } catch (error) {
      throw new UnauthorizedError({ message: "Token verification failed" });
    }
  }
}
