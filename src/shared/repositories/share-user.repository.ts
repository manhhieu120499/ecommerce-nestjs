import { Injectable } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service.js';
import { VerificationCodeType } from '../../routes/auth/auth.model.js';
import { UserType } from '../models/share-user.model.js';

@Injectable()
export class ShareUserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findUniqueUser(
    uniqueObject: { email: string } | { id: number },
  ): Promise<UserType | null> {
    return await this.prismaService.user.findUnique({ where: uniqueObject });
  }

  async verifyEmailByCode({
    email,
    code,
  }: {
    email: string;
    code: string;
  }): Promise<VerificationCodeType | null> {
    const result = await this.prismaService.verificationCode.findUnique({
      where: { email, code },
    });
    return result;
  }

  async createVerifyCodeEmail(
    data: Omit<VerificationCodeType, 'id' | 'createdAt'>,
  ): Promise<VerificationCodeType> {
    return await this.prismaService.verificationCode.create({
      data: {
        email: data.email,
        code: data.code,
        type: data.type,
        expiresAt: data.expiresAt,
      },
    });
  }

  async deleteVerifyCationCode(email: string, code: string) {
    return await this.prismaService.verificationCode.delete({
      where: { email, code },
    });
  }
}
