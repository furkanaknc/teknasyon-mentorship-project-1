export interface JwtPayload {
  sub: string;
  username: string;
  iat?: number;
  exp?: number;
}

export interface VerifiedUser {
  id: string;
  email: string;
  username: string;
}
