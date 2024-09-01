import { UnauthorizedException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { Profiles } from '@prisma/client'

import { FirebaseService } from 'src/firebase/firebase.service'
import { PrismaModule } from 'src/prisma/prisma.module'
import { PrismaService } from 'src/prisma/prisma.service'

import { AuthService } from './auth.service'

describe('AuthService', () => {
  let authService: AuthService
  let firebaseService: FirebaseService
  let prismaService: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: FirebaseService,
          useValue: {
            verifyToken: jest.fn(),
          },
        },
      ],
      imports: [PrismaModule],
    }).compile()

    authService = module.get<AuthService>(AuthService)
    firebaseService = module.get<FirebaseService>(FirebaseService)
    prismaService = module.get<PrismaService>(PrismaService)
  })

  describe('validateServiceToken', () => {
    it('should return user data if token is valid', async () => {
      const token = 'valid-token'
      const decodedToken = { uid: '123', email: 'test@example.com' }
      jest
        .spyOn(firebaseService, 'verifyToken')
        .mockResolvedValue(decodedToken as any)

      const result = await authService.validateServiceToken(token)
      expect(result).toEqual({ uid: '123', email: 'test@example.com' })
    })

    it('should throw UnauthorizedException if token is invalid', async () => {
      const token = 'invalid-token'
      jest
        .spyOn(firebaseService, 'verifyToken')
        .mockRejectedValue(new Error('Invalid token'))

      await expect(authService.validateServiceToken(token)).rejects.toThrow(
        UnauthorizedException,
      )
    })
  })

  describe('validateUser', () => {
    it('should return profile if user and profile exist', async () => {
      const token = 'valid-token'
      const decodedToken = { uid: '123', email: 'test@example.com' }
      const profile: Profiles = {
        id: 'profile-id',
        authId: '123',
        email: 'test@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
        fullname: 'test',
        lookingForPositionsIds: [],
        currentPositionId: '',
      }
      jest
        .spyOn(firebaseService, 'verifyToken')
        .mockResolvedValue(decodedToken as any)

      jest
        .spyOn(prismaService.profiles, 'findUnique')
        .mockResolvedValue(profile)

      const result = await authService.validateUser(token)
      expect(result).toEqual(profile)
    })

    it('should throw UnauthorizedException if profile is not found', async () => {
      const token = 'valid-token'
      const decodedToken = { uid: '123', email: 'test@example.com' }
      jest
        .spyOn(firebaseService, 'verifyToken')
        .mockResolvedValue(decodedToken as any)
      jest.spyOn(prismaService.profiles, 'findUnique').mockResolvedValue(null)

      await expect(authService.validateUser(token)).rejects.toThrow(
        UnauthorizedException,
      )
    })

    it('should throw UnauthorizedException if token is invalid', async () => {
      const token = 'invalid-token'
      jest
        .spyOn(firebaseService, 'verifyToken')
        .mockRejectedValue(new Error('Invalid token'))

      await expect(authService.validateUser(token)).rejects.toThrow(
        UnauthorizedException,
      )
    })
  })
})
