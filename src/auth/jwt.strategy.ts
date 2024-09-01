import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import {
  Strategy as PassportBearerStrategy,
  VerifyFunction as BearerVerifyFunction,
} from 'passport-http-bearer'
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt'

import { AuthService } from './auth.service'
import { JwtPayload } from './interfaces/jwt-payload.interface'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: `-----BEGIN PRIVATE KEY-----\r\n${process.env.JWT_SECRET}\r\n-----END PRIVATE KEY-----`,
    } as StrategyOptions)
  }

  async validate(payload: JwtPayload) {
    console.log('payload', payload)

    return { userId: payload.sub, email: payload.email }
  }
}

@Injectable()
export class ServiceAuthStrategy extends PassportStrategy(
  PassportBearerStrategy,
  'service-auth',
) {
  constructor(private readonly authService: AuthService) {
    super()
  }

  validate: BearerVerifyFunction = async (token) => {
    const { error } = await this.authService.validateServiceToken(token)

    if (error) throw new UnauthorizedException()

    return { isService: true }
  }
}
