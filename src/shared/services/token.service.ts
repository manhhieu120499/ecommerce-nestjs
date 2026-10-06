import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { envConfig } from '../configs/env.config.js';
import { StringValue } from 'ms';
import { TokenPayload } from '../types/token.type.js';
import { PrismaService } from './prisma.service.js';
import { RefreshResDTO } from '../../routes/auth/auth.dto.js';
import { isNotFoundRecordError } from '../helper.js';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
  ) {}

  signAccessToken(payload: { userId: number }) {
    return this.jwtService.signAsync(payload, {
      secret: envConfig.ACCESS_TOKEN_SECRET,
      expiresIn: envConfig.ACCESS_TOKEN_EXPIRED as StringValue,
      algorithm: 'HS256',
    });
  }

  signRefreshToken(payload: { userId: number }) {
    return this.jwtService.signAsync(payload, {
      secret: envConfig.REFRESH_TOKEN_SECRET,
      expiresIn: envConfig.REFRESH_TOKEN_EXPIRED as StringValue,
      algorithm: 'HS256',
    });
  }

  verifyAccessToken(token: string): Promise<TokenPayload> {
    return this.jwtService.verifyAsync(token, {
      secret: envConfig.ACCESS_TOKEN_SECRET,
    });
  }

  verifyRefreshToken(token: string): Promise<TokenPayload> {
    return this.jwtService.verifyAsync(token, {
      secret: envConfig.REFRESH_TOKEN_SECRET,
    });
  }

  async generateRefreshToken(refreshToken: string): Promise<RefreshResDTO> {
    const decodeRefreshToken = await this.verifyRefreshToken(refreshToken);

    const [newAccessToken, newRefreshToken] = await Promise.all([
      this.signAccessToken({ userId: decodeRefreshToken.userId }),
      this.signRefreshToken({ userId: decodeRefreshToken.userId }),
    ]);

    const decodeNewRefreshToken =
      await this.verifyRefreshToken(newRefreshToken);

    try {
      //update refresh token into database
      await this.rotateRefreshToken({
        oldToken: refreshToken,
        newToken: newRefreshToken,
        userId: decodeRefreshToken.userId,
        expiresAt: new Date(decodeNewRefreshToken.exp * 1000),
      });
    } catch (err) {
      if (isNotFoundRecordError(err)) {
        throw new UnauthorizedException('Refresh token is revoked');
      }
      throw err;
    }

    return {
      userId: decodeRefreshToken.userId,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async rotateRefreshToken(params: {
    oldToken: string;
    newToken: string;
    userId: number;
    expiresAt: Date;
  }) {
    return this.prismaService.$transaction(async (tx) => {
      await tx.refreshToken.delete({
        where: {
          token: params.oldToken,
        },
      });

      return tx.refreshToken.create({
        data: {
          token: params.newToken,
          userId: params.userId,
          expiresAt: params.expiresAt,
        },
      });
    });
  }
}
