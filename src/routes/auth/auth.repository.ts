import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/services/prisma.service.js';
import {
  CreateUserType,
  TokenType,
  UserType,
  VerificationCodeType,
} from './auth.model.js';
import { VerificationCodeTypeConstant } from '../../shared/types/auth.type.js';

@Injectable()
export class AuthRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createUser(data: CreateUserType): Promise<Omit<UserType, 'password'>> {
    const user = await this.prismaService.user.create({
      data: {
        email: data.email,
        password: data.password,
        name: data.name,
        phoneNumber: data.phoneNumber,
        roleId: data.roleId,
      },
      omit: {
        password: true,
        topSecret: true,
      },
    });

    return user;
  }

  async createToken(data: TokenType): Promise<TokenType> {
    return await this.prismaService.refreshToken.create({
      data: {
        token: data.token,
        userId: data.userId,
        expiresAt: data.expiresAt,
      },
    });
  }

  async deleteToken(token: string) {
    return await this.prismaService.refreshToken.delete({
      where: { token },
    });
  }

  async findToken(token: string): Promise<TokenType | null> {
    return await this.prismaService.refreshToken.findUnique({
      where: { token },
    });
  }
}
