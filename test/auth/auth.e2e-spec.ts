import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from 'src/app.module'
import { AuthService } from 'src/auth/auth.service'
import { FirebaseService } from 'src/firebase/firebase.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { PrismaClient } from '@prisma/client'

describe('AuthController (e2e)', () => {
  let app: INestApplication
  let authService: AuthService
  let firebaseService: FirebaseService

  let prismaClient: PrismaClient

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [AuthService, FirebaseService, PrismaClient, PrismaService],
    })
      .overrideProvider(FirebaseService)
      .useValue({
        verifyToken: jest.fn(),
      })
      .compile()

    app = moduleFixture.createNestApplication()

    authService = moduleFixture.get<AuthService>(AuthService)
    firebaseService = moduleFixture.get<FirebaseService>(FirebaseService)
    prismaClient = moduleFixture.get<PrismaClient>(PrismaClient)

    await app.init()
    await prismaClient.$connect()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  afterAll(async () => {
    await prismaClient.profile.deleteMany()
    await prismaClient.$disconnect()
    await app.close()
  })

  describe('/auth/login (POST)', () => {
    beforeEach(async () => {
      await prismaClient.profile.create({
        data: {
          authId: 'test-uid',
          email: 'test@example.com',
          fullname: 'Test User',
        },
      })
    })

    it('should return user data and access token on successful login', async () => {
      const mockUser = await prismaClient.profile.findFirst()
      const mockToken = 'mock-firebase-token'
      jest.spyOn(authService, 'validateUser').mockResolvedValue(mockUser)
      jest.spyOn(firebaseService, 'verifyToken').mockResolvedValue({
        uid: mockUser.authId,
        email: mockUser.email,
      } as any)

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ firebaseToken: mockToken })
        .expect(201)
      // .expect({ user: mockUser, access_token: mockToken })

      expect(response.body).toEqual({
        user: {
          ...mockUser,
          createdAt: mockUser.createdAt.toISOString(),
          updatedAt: mockUser.updatedAt.toISOString(),
        },
        access_token: mockToken,
      })
    })
  })
})
