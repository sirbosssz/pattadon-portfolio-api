import { Injectable, UnauthorizedException } from '@nestjs/common'
import { FirebaseService } from 'src/firebase/firebase.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { Profile } from '@prisma/client'
import { DecodedToken } from './interfaces/decoded-token.interface'
import { auth } from 'firebase-admin'

@Injectable()
export class AuthService {
  constructor(
    private readonly firebaseService: FirebaseService,
    private prisma: PrismaService,
  ) {}

  async validateServiceToken(token: string): Promise<DecodedToken> {
    try {
      const decodedToken: auth.DecodedIdToken =
        await this.firebaseService.verifyToken(token)
      return { uid: decodedToken.uid, email: decodedToken.email }
    } catch (error) {
      throw new UnauthorizedException('Invalid token', error)
    }
  }

  async validateUser(token: string): Promise<Profile> {
    try {
      const decodedToken = await this.firebaseService.verifyToken(token)
      const user = { uid: decodedToken.uid, email: decodedToken.email }

      const profile: Profile | null = await this.prisma.profile.findUnique({
        where: { authId: user.uid },
      })

      if (!profile) {
        throw new UnauthorizedException('Profile not found')
      }
      return profile
    } catch (error) {
      throw new UnauthorizedException(error.message || 'Invalid token')
    }
  }
}
