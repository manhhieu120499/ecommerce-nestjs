import { createZodDto } from 'nestjs-zod';
import z, { email } from 'zod';
import { UserStatus } from '../../generated/prisma/enums.js';

const CredentialSchema = z
  .object({
    email: z.email({ error: 'Email is string' }),
    password: z
      .string({ error: 'Password is string' })
      .min(10, { error: 'Password must have greater than 8 character' }),
  })
  .strict();

const RegisterUserSchema = z
  .object({
    email: z.email({ error: 'Email is string' }),
    password: z
      .string({ error: 'Password is string' })
      .min(10, { error: 'Password must have greater than 10 character' }),
    confirmPassword: z
      .string({ error: 'Password is string' })
      .min(10, { error: 'Password must have greater than 10 character' }),
    name: z.string({ error: 'Name is string' }),
    phoneNumber: z
      .string({ error: 'Phone number is string' })
      .min(10, { error: 'Phone number must have min 10 character' })
      .max(15, { error: 'Phone number must have max 15 character' }),
  })
  .strict()
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: 'custom',
        message: 'password and confirmPassword must be same',
        path: ['confirmPassword'],
      });
    }
  });

const UserSchema = z.object({
  id: z.number(),
  email: z.email(),
  name: z.string(),
  phoneNumber: z.string().min(10).max(15),
  avatar: z.string().nullable(),
  status: z.enum([UserStatus.ACTIVE, UserStatus.BLOCKED, UserStatus.INACTIVE]),
  roleId: z.number(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const CredentialResSchema = z
  .object({
    userId: z.number({ error: 'UserId is required and type number' }),
    email: z.email({ error: 'Email is required and type email' }),
    accessToken: z.string({ error: 'AccessToken is required and type string' }),
    refreshToken: z.string({
      error: 'AccessToken is required and type string',
    }),
  })
  .strict();

export class CredentialDTO extends createZodDto(CredentialSchema) {}
export class RegisterUserDTO extends createZodDto(RegisterUserSchema) {}

export class RegisterResDTO extends createZodDto(UserSchema) {}

export class LoginResDTO extends createZodDto(CredentialResSchema) {}
