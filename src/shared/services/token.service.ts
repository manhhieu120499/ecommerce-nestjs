import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { envConfig } from '../configs/env.config.js';
import { StringValue } from 'ms';
import { TokenPayload } from '../types/token.type.js';
import { PrismaService } from './prisma.service.js';
import { RefreshResDTO } from '../../routes/auth/auth.dto.js';

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
    try {
      const today = new Date();
      today.setDate(today.getDate() + 29); // tối đa 30 ngày
      const decodeRefreshToken = await this.verifyRefreshToken(refreshToken);

      // remove refresh token old
      await this.prismaService.refreshToken.delete({
        where: { token: refreshToken },
      });

      const [newAccessToken, newRefreshToken] = await Promise.all([
        this.signAccessToken({ userId: decodeRefreshToken.userId }),
        this.signRefreshToken({ userId: decodeRefreshToken.userId }),
      ]);

      //update refresh token into database
      await this.prismaService.refreshToken.create({
        data: {
          token: newRefreshToken,
          userId: decodeRefreshToken.userId,
          expiresAt: today,
        },
      });

      return {
        userId: decodeRefreshToken.userId,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (err) {
      throw new UnauthorizedException('Unauthorized token');
    }
  }
}
