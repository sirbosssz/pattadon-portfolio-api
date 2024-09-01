import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common'
import { AuthService } from './auth.service'
import { JwtAuthGuard } from './jwt-auth.guard'
import { Profile } from '@prisma/client'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body('firebaseToken') firebaseToken: string) {
    const user: Profile = await this.authService.validateUser(firebaseToken)
    return { user, access_token: firebaseToken }
  }

  @Get('check')
  @UseGuards(JwtAuthGuard)
  async checkAuthStatus() {
    return { authorize_status: 'authorized' }
  }
}
