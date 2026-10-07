import { Global, Module } from '@nestjs/common';
import { PrismaService } from './services/prisma.service.js';
import { JwtModule } from '@nestjs/jwt';
import { TokenService } from './services/token.service.js';
import { HashingService } from './services/hashing.service.js';
import { ShareUserRepository } from './repositories/share-user.repository.js';
import { EmailService } from './services/email.service.js';

const sharedService = [
  PrismaService,
  TokenService,
  HashingService,
  ShareUserRepository,
  EmailService,
];

@Global()
@Module({
  imports: [JwtModule],
  providers: sharedService,
  exports: sharedService,
})
export class SharedModule {}
