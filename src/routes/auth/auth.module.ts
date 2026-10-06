import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { RoleService } from './role.service.js';
import { AuthRepository } from './auth.repository.js';

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [AuthService, RoleService, AuthRepository],
  exports: [],
})
export class AuthModule {}
