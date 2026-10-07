import { createZodDto } from 'nestjs-zod';
import {
  CredentialResSchema,
  CredentialSchema,
  RegisterUserSchema,
  ResendOTPSchema,
  SendOTPSchema,
  UserSchema,
} from './auth.model.js';

export class CredentialDTO extends createZodDto(CredentialSchema) {}
export class RegisterUserDTO extends createZodDto(RegisterUserSchema) {}

export class RegisterResDTO extends createZodDto(UserSchema) {}

export class LoginResDTO extends createZodDto(CredentialResSchema) {}

export class SendOTPDTO extends createZodDto(SendOTPSchema) {}

export class ResendOTPDTO extends createZodDto(ResendOTPSchema) {}
