import { Body, Controller, Post } from '@nestjs/common';
import {
  type LoginDTOInput,
  LoginUserSchema,
  type RegisterDTOInput,
  type LogoutDTOInput,
  type RefreshTokenDTOInput,
  RegisterSchema,
  LogoutSchema,
  RefreshUserSchema,
} from './auth.dto.js';
import { AuthService } from './auth.service.js';
import { ZodValidationPipe } from '../../shared/pipes/zod-validate.pipe.js';
import { ZodSerializerDto } from 'nestjs-zod';
import {
  CredentialDTO,
  LoginResDTO,
  RegisterResDTO,
  RegisterUserDTO,
} from './auth_zod.dto.js';

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
  async register(@Body() body: RegisterUserDTO): Promise<RegisterResDTO> {
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
}
