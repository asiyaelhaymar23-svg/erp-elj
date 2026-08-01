import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'change-me-in-env',
    });
  }

  async validate(payload: { sub: number; email: string; role: string }) {
    // payload est injecté dans request.user pour les guards/décorateurs
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
