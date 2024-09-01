import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { PrismaClient } from '@prisma/client'
import * as request from 'supertest'

import { AppModule } from 'src/app.module'
import { AuthService } from 'src/auth/auth.service'
import { FirebaseService } from 'src/firebase/firebase.service'
import { PrismaService } from 'src/prisma/prisma.service'

describe('Authentication Flow (e2e)', () => {
  let app: INestApplication
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

    firebaseService = moduleFixture.get<FirebaseService>(FirebaseService)
    prismaClient = moduleFixture.get<PrismaClient>(PrismaClient)

    await app.init()
    await prismaClient.$connect()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  afterAll(async () => {
    await prismaClient.$disconnect()
    await app.close()
  })

  describe('/auth/login (POST)', () => {
    beforeAll(async () => {
      await prismaClient.positions.createMany({
        data: [
          { name: 'Frontend Developer' },
          { name: 'Fullstack Developer' },
          { name: 'Senior Fullstack Developer' },
          { name: 'Tech Lead' },
        ],
      })
      const currentPosition = await prismaClient.positions.findFirst({
        where: { name: 'Fullstack Developer' },
      })
      const lookingForPositions = await prismaClient.positions.findMany({
        where: { name: { in: ['Senior Fullstack Developer', 'Tech Lead'] } },
      })
      await prismaClient.profile.create({
        data: {
          authId: 'test-uid',
          email: 'test@example.com',
          fullname: 'Test User',
          currentPosition: {
            connect: {
              id: currentPosition.id,
            },
          },
          lookingForPositions: {
            connect: lookingForPositions.map((position) => ({
              id: position.id,
            })),
          },
        },
      })
    })

    afterAll(async () => {
      await prismaClient.profile.deleteMany()
      await prismaClient.positions.deleteMany()
    })

    it('should return user data and access token on successful login', async () => {
      const mockUser = await prismaClient.profile.findFirst()
      const mockToken = 'mock-firebase-token'
      jest.spyOn(firebaseService, 'verifyToken').mockResolvedValue({
        uid: mockUser.authId,
        email: mockUser.email,
      } as any)

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ firebaseToken: mockToken })
        .expect(201)

      expect(response.body).toEqual({
        user: {
          ...mockUser,
          createdAt: mockUser.createdAt.toISOString(),
          updatedAt: mockUser.updatedAt.toISOString(),
        },
        access_token: mockToken,
      })
    })

    it('should return 401 Unauthorized if user is not found', async () => {
      const mockToken = 'mock-firebase-token'
      jest.spyOn(firebaseService, 'verifyToken').mockResolvedValue({
        uid: 'non-existent-uid',
        email: 'non-existent-email',
      } as any)

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ firebaseToken: mockToken })
        .expect(401)

      expect(response.body.message).toEqual('Profile not found')
    })

    it('should return 401 Unauthorized if firebase login fails', async () => {
      const mockToken = 'mock-firebase-token'
      jest.spyOn(firebaseService, 'verifyToken').mockRejectedValue(new Error())

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ firebaseToken: mockToken })
        .expect(401)

      expect(response.body.message).toEqual('Invalid token')
    })
  })

  describe('/auth/check (GET)', () => {
    it('should return 200 OK if the user is authorized', async () => {
      const mockToken = 'mock-firebase-token'
      jest.spyOn(firebaseService, 'verifyToken').mockResolvedValue({
        uid: 'test-uid',
        email: 'test@example.com',
      } as any)

      const response = await request(app.getHttpServer())
        .get('/auth/check')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(200)

      expect(response.body.authorize_status).toEqual('authorized')
    })

    it('should return 401 Unauthorized if the user is not authorized', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/check')
        .expect(401)

      expect(response.body.message).toEqual('Unauthorized')
    })
  })
})
