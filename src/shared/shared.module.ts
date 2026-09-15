import { Global, Module } from '@nestjs/common';
import { PrismaService } from './services/prisma.service.js';
import { JwtModule } from '@nestjs/jwt';
import { TokenService } from './services/token.service.js';
import { HashingService } from './services/hashing.service.js';

const sharedService = [PrismaService, TokenService, HashingService];

@Global()
@Module({
  imports: [JwtModule],
  providers: sharedService,
  exports: sharedService,
})
export class SharedModule {}
