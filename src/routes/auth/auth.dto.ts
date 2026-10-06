import { z } from 'zod';

const LoginSchema = z.object({
  userId: z.number({ error: 'userId is number' }),
  email: z.email({ error: 'email is required' }),
  password: z
    .string({ error: 'password is required' })
    .min(8, { error: 'password must be greater than eight' }),
  accessToken: z.string({ error: 'accessToken is string' }),
  refreshToken: z.string({ error: 'refreshToken is string' }),
});

export const LoginUserSchema = z.object({
  email: z.email({ error: 'email is required' }),
  password: z
    .string({ error: 'password is required' })
    .min(8, { error: 'password must be greater than eight' }),
});

export const RefreshUserSchema = z.object({
  refreshToken: z.string({ error: 'refresh_token is string' }),
});

// Register schema
export const RegisterSchema = z.object({
  email: z.email({ error: 'Email in valid' }),
  password: z
    .string({ error: 'password is required' })
    .min(8, { error: 'password must be greater than eight' }),
  name: z.string({ error: 'Name must be string' }),
  phoneNumber: z
    .string({ error: 'Phone number is string' })
    .min(10, { error: 'Phone number must have greater than 10' }),
  roleId: z.number({ error: 'RoleId is required' }),
});

const RegisterResSchema = z.object({
  email: z.email({ error: 'Email in valid' }),
  phoneNumber: z
    .string({ error: 'Phone number is string' })
    .min(10, { error: 'Phone number must have greater than 10' }),
  name: z.string({ error: 'Name must be string' }),
  roleId: z.number({ error: 'RoleId is required' }),
});

// Logout schema
export const LogoutSchema = z.object({
  refresh_token: z.string({ error: 'Refresh token is string' }),
});

export type LoginType = z.infer<typeof LoginSchema>; // kiểu dữ liệu chuẩn
export type LoginResDTO = Omit<LoginType, 'password'>;
export type LoginDTOInput = Pick<LoginType, 'email' | 'password'>;
export type RefreshResDTO = Pick<
  LoginType,
  'userId' | 'accessToken' | 'refreshToken'
>;

// type register
export type RegisterType = z.infer<typeof RegisterSchema>;
export type RegisterDTOInput = z.infer<typeof RegisterSchema>;
export type RegisterResDTO = z.infer<typeof RegisterResSchema>;

// type logout
export type LogoutDTOInput = z.infer<typeof LogoutSchema>;

export type RefreshTokenDTOInput = z.infer<typeof LogoutSchema>;
export type RefreshTokenResDTO = z.infer<typeof RefreshUserSchema>;
