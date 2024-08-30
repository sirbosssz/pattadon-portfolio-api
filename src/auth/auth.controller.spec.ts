import { Test, TestingModule } from '@nestjs/testing'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'

describe('AuthController', () => {
  let authController: AuthController
  let authService: AuthService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            validateUser: jest.fn(),
          },
        },
      ],
    }).compile()

    authController = module.get<AuthController>(AuthController)
    authService = module.get<AuthService>(AuthService)
  })

  it('should be defined', () => {
    expect(authController).toBeDefined()
  })

  describe('login', () => {
    it('should call validateUser and return user data with token', async () => {
      const mockUser = { id: 1, name: 'Test User' }
      const mockToken = 'mock-firebase-token'
      jest.spyOn(authService, 'validateUser').mockResolvedValue(mockUser)

      const result = await authController.login(mockToken)

      expect(authService.validateUser).toHaveBeenCalledWith(mockToken)
      expect(result).toEqual({ user: mockUser, access_token: mockToken })
    })
  })

  describe('checkAuthStatus', () => {
    it('should return authorized status', async () => {
      const result = await authController.checkAuthStatus()
      expect(result).toEqual({ authorize_status: 'authorized' })
    })
  })
})
