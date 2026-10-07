import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  type LoginResDTO,
  type LoginDTOInput,
  LogoutDTOInput,
  type RefreshTokenDTOInput,
  RefreshTokenResDTO,
} from './auth.dto.js';
import { HashingService } from '../../shared/services/hashing.service.js';
import { TokenService } from '../../shared/services/token.service.js';
import { RoleService } from './role.service.js';
import {
  generateOTP,
  isNotFoundRecordError,
  isUniqueConstraintError,
} from '../../shared/helper.js';
import { RegisterUserDTO, RegisterResDTO } from './auth_zod.dto.js';
import { AuthRepository } from './auth.repository.js';
import { type VerificationCodeTypeConstant } from '../../shared/types/auth.type.js';
import ms, { StringValue } from 'ms';
import { envConfig } from '../../shared/configs/env.config.js';
import { ShareUserRepository } from '../../shared/repositories/share-user.repository.js';
import { addMilliseconds } from 'date-fns';
import { EmailService } from '../../shared/services/email.service.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly hashingService: HashingService,
    private readonly tokenService: TokenService,
    private readonly roleService: RoleService,
    private readonly authRepository: AuthRepository,
    private readonly shareUserRepository: ShareUserRepository,
    private readonly emailService: EmailService,
  ) {}

  async login(body: LoginDTOInput): Promise<LoginResDTO> {
    const user = await this.shareUserRepository.findUniqueUser({
      email: body.email,
    });

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
  async register(
    body: RegisterUserDTO,
  ): Promise<Omit<RegisterResDTO, 'password'>> {
    try {
      // check verify email
      const isValidEmail = await this.shareUserRepository.verifyEmailByCode({
        email: body.email,
        code: body.code,
      });

      if (!isValidEmail)
        throw new UnprocessableEntityException([
          {
            path: ' code | email',
            message: 'Not verify your email, invalid code or email invalid',
          },
        ]);

      if (Date.now() > isValidEmail.expiresAt.getTime()) {
        throw new UnprocessableEntityException([
          { message: 'OTP expired, Please resend code', path: 'code' },
        ]);
      }

      const clientRoleId = await this.roleService.getCacheRoleId();

      const hashPassword = this.hashingService.hash(body.password);
      const newUser = await this.authRepository.createUser({
        email: body.email,
        password: hashPassword,
        name: body.name,
        phoneNumber: body.phoneNumber,
        roleId: clientRoleId,
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

    await this.authRepository.deleteToken(body.refresh_token);

    return { message: 'Logout successfully' };
  }
  async refreshToken(
    body: RefreshTokenDTOInput,
  ): Promise<RefreshTokenResDTO | null> {
    return await this.tokenService.generateRefreshToken(body.refresh_token);
  }

  async generateVerifyCationCode(
    email: string,
    type: VerificationCodeTypeConstant,
  ): Promise<{ message: string }> {
    const isExistEmail = await this.shareUserRepository.findUniqueUser({
      email,
    });

    if (isExistEmail)
      throw new UnprocessableEntityException([
        {
          path: 'email',
          message: 'Email already exist',
        },
      ]);

    const verifyCode = generateOTP();

    //save database
    await this.shareUserRepository.createVerifyCodeEmail({
      email: email,
      code: verifyCode,
      type: type,
      expiresAt: addMilliseconds(
        new Date(),
        ms(envConfig.OTP_EXPIRED_IN as StringValue),
      ),
    });

    // service send otp
    const { error } = await this.emailService.sendOTPEmail({
      email,
      otpCode: verifyCode,
    });

    if (error) {
      throw new InternalServerErrorException(error);
    }

    return { message: 'Send OTP successful' };
  }

  async reGenerateVerifyCationCode(
    email: string,
    type: VerificationCodeTypeConstant,
    code: string,
  ): Promise<{ message: string }> {
    const verifyCode = generateOTP();
    try {
      // delete old code
      await this.shareUserRepository.deleteVerifyCationCode(email, code);

      //save database
      await this.shareUserRepository.createVerifyCodeEmail({
        email: email,
        code: verifyCode,
        type: type,
        expiresAt: addMilliseconds(
          new Date(),
          ms(envConfig.OTP_EXPIRED_IN as StringValue),
        ),
      });

      // service send otp
      const { error } = await this.emailService.sendOTPEmail({
        email,
        otpCode: verifyCode,
      });

      if (error) {
        throw new InternalServerErrorException(error);
      }
    } catch (err) {
      if (isNotFoundRecordError(err))
        throw new UnprocessableEntityException('Old code record not found');
      return { message: `Send OTP failed, ${err}` };
    }
    return { message: 'Send OTP successful' };
  }
}
