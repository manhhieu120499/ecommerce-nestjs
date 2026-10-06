import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/services/prisma.service.js';
import {
  type LoginResDTO,
  type LoginDTOInput,
  RegisterDTOInput,
  LogoutDTOInput,
  type RefreshTokenDTOInput,
  RefreshTokenResDTO,
} from './auth.dto.js';
import { HashingService } from '../../shared/services/hashing.service.js';
import { TokenService } from '../../shared/services/token.service.js';
import { RoleService } from './role.service.js';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { JsonWebTokenError } from '@nestjs/jwt';
import { isUniqueConstraintError } from '../../shared/helper.js';
import { RegisterUserDTO, RegisterResDTO } from './auth_zod.dto.js';
import { AuthRepository } from './auth.repository.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly hashingService: HashingService,
    private readonly tokenService: TokenService,
    private readonly roleService: RoleService,
    private readonly authRepository: AuthRepository,
  ) {}

  async login(body: LoginDTOInput): Promise<LoginResDTO> {
    const user = await this.authRepository.findUser(body.email);

    if (!user) throw new NotFoundException('Email not exist');

    const matchPassword = this.hashingService.compare(
      body.password,
      user.password,
    );

    if (!matchPassword) throw new UnauthorizedException('Password incorrect');

    // create access token and refresh token
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.signAccessToken({ userId: user.id }),
      this.tokenService.signRefreshToken({ userId: user.id }),
    ]);

    // decode refresh token
    const decodeRefreshToken =
      await this.tokenService.verifyRefreshToken(refreshToken);

    // update refresh token to database
    await this.authRepository.createToken({
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(decodeRefreshToken.exp * 1000),
    });

    return { userId: user.id, email: user.email, accessToken, refreshToken };
  }
  async register(body: RegisterUserDTO): Promise<RegisterResDTO> {
    try {
      const clientRoleId = await this.roleService.getCacheRoleId();

      const hashPassword = this.hashingService.hash(body.password);
      const newUser = await this.authRepository.createUser({
        email: body.email,
        password: hashPassword,
        name: body.name,
        phoneNumber: body.phoneNumber,
        roleId: clientRoleId,
        confirmPassword: body.confirmPassword,
      });

      return newUser;
    } catch (err) {
      if (isUniqueConstraintError(err))
        throw new ConflictException('Email already exist');
      throw err;
    }
  }

  async logout(body: LogoutDTOInput): Promise<{ message: string }> {
    const checkToken = await this.authRepository.findToken(body.refresh_token);

    if (!checkToken) throw new UnauthorizedException('Unauthorized');

    const removeToken = await this.authRepository.deleteToken(
      body.refresh_token,
    );

    return { message: 'Logout successfully' };
  }
  async refreshToken(
    body: RefreshTokenDTOInput,
  ): Promise<RefreshTokenResDTO | null> {
    return await this.tokenService.generateRefreshToken(body.refresh_token);
  }
}
