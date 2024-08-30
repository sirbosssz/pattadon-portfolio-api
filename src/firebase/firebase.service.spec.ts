import { Test, TestingModule } from '@nestjs/testing'
import { FirebaseService } from './firebase.service'
import { ConfigModule } from '@nestjs/config'

jest.mock('firebase-admin')

describe('FirebaseService', () => {
  let service: FirebaseService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FirebaseService],
      imports: [ConfigModule],
    }).compile()

    service = module.get<FirebaseService>(FirebaseService)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
