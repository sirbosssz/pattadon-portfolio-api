import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as admin from 'firebase-admin'

@Injectable()
export class FirebaseService {
  private firebaseApp: admin.app.App

  constructor(private readonly configService: ConfigService) {
    const firebaseConfig = {
      type: this.configService.get<string>('FIREBASE_TYPE'),
      projectId: this.configService.get<string>('FIREBASE_PROJECT_ID'),
      privateKey: this.configService.get<string>('FIREBASE_PRIVATE_KEY'),
      privateKeyId: this.configService.get<string>('FIREBASE_PRIVATE_KEY_ID'),
      clientEmail: this.configService.get<string>('FIREBASE_CLIENT_EMAIL'),
      clientId: this.configService.get<string>('FIREBASE_CLIENT_ID'),
      authUri: this.configService.get<string>('FIREBASE_AUTH_URI'),
      tokenUri: this.configService.get<string>('FIREBASE_TOKEN_URI'),
      authProviderX509CertUrl: this.configService.get<string>(
        'FIREBASE_AUTH_PROVIDER_X509_CERT_URL',
      ),
      clientX509CertUrl: this.configService.get<string>(
        'FIREBASE_CLIENT_X509_CERT_URL',
      ),
    }

    this.firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(firebaseConfig),
    })
  }

  async verifyToken(token: string): Promise<admin.auth.DecodedIdToken> {
    return this.firebaseApp.auth().verifyIdToken(token)
  }
}
