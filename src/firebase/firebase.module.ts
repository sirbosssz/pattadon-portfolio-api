import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { FirebaseService } from './firebase.service'

@Module({
  providers: [FirebaseService],
  imports: [ConfigModule],
  exports: [FirebaseService],
})
export class FirebaseModule {}
