import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as admin from 'firebase-admin'

@Injectable()
export class FirebaseService {
  private firebaseApp: admin.app.App

  constructor(private readonly configService: ConfigService) {
    const firebaseConfig = {
      projectId: this.configService.get<string>('FIREBASE_PROJECT_ID'),
      privateKey: this.configService.get<string>('FIREBASE_PRIVATE_KEY'),
    }

    this.firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(firebaseConfig),
    })
  }

  async verifyToken(token: string): Promise<admin.auth.DecodedIdToken> {
    return this.firebaseApp.auth().verifyIdToken(token)
  }
}
