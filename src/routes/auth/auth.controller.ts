import { Body, Controller, Post } from '@nestjs/common';
import {
  type LogoutDTOInput,
  type RefreshTokenDTOInput,
  LogoutSchema,
} from './auth.dto.js';
import { AuthService } from './auth.service.js';
import { ZodValidationPipe } from '../../shared/pipes/zod-validate.pipe.js';
import { ZodSerializerDto } from 'nestjs-zod';
import {
  CredentialDTO,
  LoginResDTO,
  RegisterResDTO,
  RegisterUserDTO,
  ResendOTPDTO,
  SendOTPDTO,
} from './auth_zod.dto.js';
import { ResendOTPSchema, SendOTPSchema } from './auth.model.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  @ZodSerializerDto(LoginResDTO)
  async login(@Body() body: CredentialDTO): Promise<LoginResDTO> {
    const resp = await this.authService.login(body);
    return resp;
  }

  @Post('/register')
  @ZodSerializerDto(RegisterResDTO)
  async register(
    @Body() body: RegisterUserDTO,
  ): Promise<Omit<RegisterResDTO, 'password'>> {
    const resp = await this.authService.register(body);
    return resp;
  }

  @Post('/logout')
  async logout(
    @Body(new ZodValidationPipe(LogoutSchema)) body: LogoutDTOInput,
  ) {
    const resp = await this.authService.logout(body);
    return resp;
  }

  @Post('/refresh-token')
  async refreshToken(
    @Body(new ZodValidationPipe(LogoutSchema)) body: RefreshTokenDTOInput,
  ) {
    const resp = await this.authService.refreshToken(body);
    return resp;
  }

  @Post('/send-otp')
  async sendOTP(@Body(new ZodValidationPipe(SendOTPSchema)) body: SendOTPDTO) {
    const resp = await this.authService.generateVerifyCationCode(
      body.email,
      body.type,
    );
    return resp;
  }

  @Post('/resend-otp')
  async reSendOTP(
    @Body(new ZodValidationPipe(ResendOTPSchema)) body: ResendOTPDTO,
  ) {
    const resp = await this.authService.reGenerateVerifyCationCode(
      body.email,
      body.type,
      body.code,
    );
    return resp;
  }
}
